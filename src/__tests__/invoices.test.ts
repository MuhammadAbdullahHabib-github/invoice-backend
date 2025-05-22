import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../app';
import User from '../models/User';
import Customer from '../models/Customer';
import Invoice from '../models/Invoice';
import sequelize from '../config/database';

describe('Invoice Controller', () => {
  let authToken: string;
  let testUser: User;
  let testCustomer: Customer;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test user
    const password = await bcrypt.hash('testpassword', 10);
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password,
    });

    // Create test customer
    testCustomer = await Customer.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345',
        country: 'Test Country',
      },
      userId: testUser.id,
    });

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser.id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Invoice.destroy({ where: {} });
  });

  describe('GET /api/invoices', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/invoices');
      expect(response.status).toBe(401);
    });

    it('should return empty array when no invoices exist', async () => {
      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all invoices', async () => {
      await Invoice.create({
        invoiceNumber: 'INV-001',
        amount: 1000,
        dueDate: new Date(),
        status: 'pending',
        customerId: testCustomer.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('invoiceNumber', 'INV-001');
    });
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        invoiceNumber: 'INV-002',
        amount: 2000,
        dueDate: new Date(),
        status: 'pending',
        customerId: testCustomer.id,
      };

      const response = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('invoiceNumber', invoiceData.invoiceNumber);
      expect(response.body).toHaveProperty('userId', testUser.id);
    });

    it('should return 400 for invalid invoice data', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invoiceNumber: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/invoices/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          message: 'Invalid invoice ID',
        })
      );
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .get('/api/invoices/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return invoice by id', async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-003',
        amount: 3000,
        dueDate: new Date(),
        status: 'pending',
        customerId: testCustomer.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .get(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('invoiceNumber', 'INV-003');
    });
  });

  describe('PATCH /api/invoices/:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .patch('/api/invoices/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 4500 });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          message: 'Invalid invoice ID',
        })
      );
    });

    it('should update invoice with partial data', async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-004',
        amount: 4000,
        dueDate: new Date(),
        status: 'pending',
        customerId: testCustomer.id,
        userId: testUser.id,
      });

      const updateData = {
        amount: 4500,
        status: 'paid',
      };

      const response = await request(app)
        .patch(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('amount', updateData.amount);
      expect(response.body).toHaveProperty('status', updateData.status);
      // Original data should be preserved
      expect(response.body).toHaveProperty('invoiceNumber', invoice.invoiceNumber);
      expect(response.body).toHaveProperty('dueDate');
    });

    it('should return 400 for invalid update data', async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-005',
        amount: 5000,
        dueDate: new Date(),
        status: 'pending',
        customerId: testCustomer.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .patch(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid-status',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'status',
          message: 'Invalid status',
        })
      );
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    it('should delete invoice', async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-005',
        amount: 5000,
        dueDate: new Date(),
        status: 'pending',
        customerId: testCustomer.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .delete(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      const deletedInvoice = await Invoice.findByPk(invoice.id);
      expect(deletedInvoice).toBeNull();
    });
  });

  describe('POST /api/invoices/:id/send', () => {
    it('should mark invoice as sent', async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-006',
        amount: 6000,
        dueDate: new Date(),
        status: 'pending',
        customerId: testCustomer.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .post(`/api/invoices/${invoice.id}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'sent');
    });
  });

  describe('POST /api/invoices/:id/mark-paid', () => {
    it('should mark invoice as paid', async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-007',
        amount: 7000,
        dueDate: new Date(),
        status: 'sent',
        customerId: testCustomer.id,
        userId: testUser.id,
      });

      const response = await request(app)
        .post(`/api/invoices/${invoice.id}/mark-paid`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'paid');
    });
  });
}); 