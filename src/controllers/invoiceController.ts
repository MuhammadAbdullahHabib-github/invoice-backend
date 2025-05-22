import { Request, Response } from 'express';
import Invoice, { InvoiceDocument } from '../models/Invoice';
import { ErrorResponse } from '../utils/error';
import { InvoiceAttributes } from '../types';
import mongoose from 'mongoose';
import Customer from '../models/Customer';

function mapInvoice(doc: InvoiceDocument) {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices.map(mapInvoice));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to fetch invoices');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const getOne = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      throw new ErrorResponse('Invoice not found', 404);
    }
    res.json(mapInvoice(invoice));
  } catch (error) {
    if (error instanceof ErrorResponse) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to fetch invoice' });
    }
  }
};

export const create = async (req: Request<{}, {}, Omit<InvoiceAttributes, 'userId'>>, res: Response): Promise<void> => {
  try {
    console.log('Invoice create req.body:', req.body);
    const userId = (req as any).user.id;
    const { customerId } = req.body;
    console.log('customerId from request:', customerId);
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({ errors: [{ field: 'customerId', message: 'Invalid customer ID format' }] });
      return;
    }
    const customer = await Customer.findById(customerId);
    console.log('customer found:', customer);
    if (!customer) {
      res.status(400).json({ errors: [{ field: 'customerId', message: 'Invalid customer ID' }] });
      return;
    }
    const invoice = await Invoice.create({ ...req.body, userId, customFields: req.body.customFields || {} });
    res.status(201).json(mapInvoice(invoice));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to create invoice');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const update = async (
  req: Request<{ id: string }, {}, Partial<Omit<InvoiceAttributes, 'userId'>>>,
  res: Response
): Promise<void> => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, customFields: req.body.customFields || {} },
      { new: true }
    );
    if (!invoice) {
      throw new ErrorResponse('Invoice not found', 404);
    }
    res.json(mapInvoice(invoice));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to update invoice');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to delete invoice');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const send = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'sent' }, { new: true });
    if (!invoice) {
      throw new ErrorResponse('Invoice not found', 404);
    }
    res.json(mapInvoice(invoice));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to send invoice');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const markPaid = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'paid' }, { new: true });
    if (!invoice) {
      throw new ErrorResponse('Invoice not found', 404);
    }
    res.json(mapInvoice(invoice));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to mark invoice as paid');
    res.status(err.statusCode).json({ message: err.message });
  }
}; 