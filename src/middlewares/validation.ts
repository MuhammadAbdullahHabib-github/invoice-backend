import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import logger from '../utils/logger';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : '',
      message: err.msg,
    }));

    logger.warn('Validation error:', { errors: formattedErrors });
    return res.status(400).json({ errors: formattedErrors });
  }
  next();
};

export const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const baseCustomerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('contact').optional().isString().withMessage('Contact must be a string'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('address.street').optional().isString().withMessage('Street must be a string'),
  body('address.city').optional().isString().withMessage('City must be a string'),
  body('address.state').optional().isString().withMessage('State must be a string'),
  body('address.zip').optional().isString().withMessage('ZIP code must be a string'),
  body('address.country').optional().isString().withMessage('Country must be a string'),
];

export const customerValidation = {
  create: [...baseCustomerValidation, handleValidationErrors],
  update: [...baseCustomerValidation, handleValidationErrors],
  id: [
    param('id').isMongoId().withMessage('Invalid customer ID'),
    handleValidationErrors,
  ],
};

export const invoiceValidation = {
  create: [
    body('invoiceNumber').notEmpty().withMessage('Invoice number is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
    body('status').isIn(['draft', 'pending', 'sent', 'paid', 'overdue']).withMessage('Invalid status'),
    body('customerId').isMongoId().withMessage('Invalid customer ID'),
    handleValidationErrors,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
    body('invoiceNumber').optional().notEmpty().withMessage('Invoice number cannot be empty'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
    body('status').optional().isIn(['draft', 'pending', 'sent', 'paid', 'overdue']).withMessage('Invalid status'),
    handleValidationErrors,
  ],
  id: [
    param('id').isMongoId().withMessage('Invalid invoice ID'),
    handleValidationErrors,
  ],
}; 