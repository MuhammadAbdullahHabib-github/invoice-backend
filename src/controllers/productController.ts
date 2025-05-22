import { Request, Response } from 'express';
import Product, { ProductDocument } from '../models/Product';

function mapProduct(doc: ProductDocument) {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}

export const getAll = async (req: Request, res: Response) => {
  const products = await Product.find();
  res.json(products.map(mapProduct));
};

export const getOne = async (req: Request<{ id: string }>, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(mapProduct(product));
};

export const create = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const product = await Product.create({ name });
  res.status(201).json(mapProduct(product));
};

export const update = async (req: Request<{ id: string }>, res: Response) => {
  const { name } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(mapProduct(product));
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.status(204).end();
}; 