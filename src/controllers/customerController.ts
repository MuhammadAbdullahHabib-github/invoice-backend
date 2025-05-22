import { Request, Response } from 'express';
import Customer, { CustomerDocument } from '../models/Customer';
import { ErrorResponse } from '../utils/error';
import { CustomerAttributes } from '../types';

function mapCustomer(doc: CustomerDocument) {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find();
    res.json(customers.map(mapCustomer));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to fetch customers');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const getOne = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      throw new ErrorResponse('Customer not found', 404);
    }
    res.json(mapCustomer(customer));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to fetch customer');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const create = async (req: Request<{}, {}, Omit<CustomerAttributes, 'userId'>>, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const customer = await Customer.create({ ...req.body, userId });
    res.status(201).json(mapCustomer(customer));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to create customer');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const update = async (
  req: Request<{ id: string }, {}, Partial<Omit<CustomerAttributes, 'userId'>>>,
  res: Response
): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      throw new ErrorResponse('Customer not found', 404);
    }
    res.json(mapCustomer(customer));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to update customer');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to delete customer');
    res.status(err.statusCode).json({ message: err.message });
  }
};

export const search = async (req: Request<{}, {}, {}, { q: string }>, res: Response): Promise<void> => {
  try {
    const query = req.query.q || '';
    const results = await Customer.find({ name: { $regex: query, $options: 'i' } });
    res.json(results.map(mapCustomer));
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Search failed');
    res.status(err.statusCode).json({ message: err.message });
  }
}; 