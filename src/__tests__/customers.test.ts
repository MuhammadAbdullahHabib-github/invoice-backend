import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../app';
import User from '../models/User';
import Customer from '../models/Customer';
import sequelize from '../config/database';

describe('Customer Controller', () => {
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test user
    const password = await bcrypt.hash('testpassword', 10);
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password,
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
    await Customer.destroy({ where: {} });
  });

  describe('GET /api/customers', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/customers');
      expect(response.status).toBe(401);
    });

    it('should return empty array when no customers exist', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all customers', async () => {
      await Customer.create({
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

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('name', 'Test Customer');
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer with minimal required fields', async () => {
      const customerData = {
        name: 'New Customer',
        email: 'new@example.com',
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', customerData.name);
      expect(response.body).toHaveProperty('userId', testUser.id);
    });

    it('should create a new customer with all fields', async () => {
      const customerData = {
        name: 'New Customer',
        email: 'new@example.com',
        phone: '9876543210',
        address: {
          street: '456 New St',
          city: 'New City',
          state: 'New State',
          zip: '54321',
          country: 'New Country',
        },
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', customerData.name);
      expect(response.body).toHaveProperty('phone', customerData.phone);
      expect(response.body).toHaveProperty('address');
      expect(response.body.address).toEqual(customerData.address);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Name is required',
        })
      );
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: 'Invalid email address',
        })
      );
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Customer',
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: 'Invalid email address',
        })
      );
    });

    it('should return 400 for invalid address structure', async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Customer',
          email: 'test@example.com',
          address: 'invalid-address', // Should be an object
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'address',
          message: 'Address must be an object',
        })
      );
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/customers/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          message: 'Invalid customer ID',
        })
      );
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return customer by id', async () => {
      const customer = await Customer.create({
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

      const response = await request(app)
        .get(`/api/customers/${customer.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Customer');
    });
  });

  describe('PATCH /api/customers/:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .patch('/api/customers/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Customer' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          message: 'Invalid customer ID',
        })
      );
    });

    it('should update customer with partial data', async () => {
      const customer = await Customer.create({
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

      const updateData = {
        name: 'Updated Customer',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .patch(`/api/customers/${customer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('email', updateData.email);
      // Original data should be preserved
      expect(response.body).toHaveProperty('phone', customer.phone);
      expect(response.body).toHaveProperty('address');
    });

    it('should return 400 for invalid update data', async () => {
      const customer = await Customer.create({
        name: 'Test Customer',
        email: 'customer@example.com',
        userId: testUser.id,
      });

      const response = await request(app)
        .patch(`/api/customers/${customer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: 'Invalid email address',
        })
      );
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .delete('/api/customers/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          message: 'Invalid customer ID',
        })
      );
    });

    it('should delete customer', async () => {
      const customer = await Customer.create({
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

      const response = await request(app)
        .delete(`/api/customers/${customer.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify customer was deleted
      const deletedCustomer = await Customer.findByPk(customer.id);
      expect(deletedCustomer).toBeNull();
    });
  });
}); 