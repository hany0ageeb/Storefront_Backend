import { Product, ProductStore } from '../models/product';
import { Application, Request, Response } from 'express';
import authenticate from './authenticate';
import { body } from 'express-validator';
import { validationResult } from 'express-validator/src/validation-result';

const index = async (_req: Request, resp: Response): Promise<void> => {
  try {
    const store = new ProductStore();
    resp.status(200).json(await store.index());
  } catch (err) {
    resp.status(500).json(err);
  }
};
const show = async (req: Request, resp: Response): Promise<void> => {
  try {
    const store = new ProductStore();
    const productId: string = req.params.id;
    const product = await store.show(productId);
    if (product) {
      resp.status(200).json(product);
    } else {
      resp.status(404).json({ message: 'Invalid product id' });
    }
  } catch (err) {
    resp.status(500).json(err);
  }
};
const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = new ProductStore();
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const product = await store.create(<Product>req.body.product);
      res.status(200).json(product);
    } else {
      res.status(422).json(errors);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
const getProductsByCategory = async (
  req: Request,
  resp: Response,
): Promise<void> => {
  try {
    const categoryName = req.params.categoryName;
    const store = new ProductStore();
    const products = await store.getProductsByCategory(categoryName);
    resp.status(200).json(products);
  } catch (err) {
    resp.status(500).json(err);
  }
};
const getTopProducts = async (req: Request, resp: Response): Promise<void> => {
  try {
    const store = new ProductStore();
    let limit = 5;
    if (req.query.limit) {
      const val = Number(req.query.limit);
      if (!isNaN(val) && val >= 1 && Number.isInteger(val)) {
        limit = val;
      } else {
        resp.status(400).json({ messagee: 'Invalid Limit' });
        return;
      }
    }
    const products = await store.getTopProducts(limit);
    resp.status(200).json(products);
  } catch (err) {
    resp.status(500).json(err);
  }
};
export const product_routes = (app: Application): void => {
  app.get('/api/products', index);
  app.get('/api/products/:id', show);
  app.post(
    '/api/products',
    authenticate,
    body('product.name')
      .notEmpty()
      .withMessage('Product name cannot be Empty.'),
    body('product.price', 'Product Price should be number').isFloat({
      min: 0,
    }),
    create,
  );
  app.get('/api/products/category/:categoryName', getProductsByCategory);
  app.get('/api/top_products', getTopProducts);
};
