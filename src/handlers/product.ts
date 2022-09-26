import { Product, ProductStore } from '../models/product';
import { Application, Request, Response } from 'express';
import authenticate, { getToken } from './authenticate';
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
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      resp.status(404).json({ message: 'Invalid product id' });
      return;
    }
    const product = await store.show(productId.toString());
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
      res.status(200).json({ token: getToken(req), product: product });
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
    resp.status(200).set('Content-Type', 'application/json').json(products);
  } catch (err) {
    resp.status(500).json(err);
  }
};
const update = async (req: Request, resp: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const productStore = new ProductStore();
      const oldProduct = await productStore.show(req.params.id);
      if (oldProduct !== null) {
        oldProduct.name = req.body.product.name;
        oldProduct.price = req.body.product.price;
        oldProduct.category = req.body.product.category;
        const newProduct = await productStore.update(oldProduct);
        if (newProduct) {
          resp.status(200).json({ token: getToken(req), product: newProduct });
        } else {
          resp.status(404).json({
            message: `Product With Id: ${req.body.id} Does not exist`,
          });
        }
      } else {
        resp.status(404).json({
          message: `Product With Id: ${req.params.id} Does not exist`,
        });
      }
    } else {
      resp.status(400).json(errors);
    }
  } catch (err) {
    let message = 'Something went wrong ';
    if (err instanceof Error) message += err.message;
    resp.status(500).json({ message: message });
  }
};
const deleteProduct = async (req: Request, resp: Response): Promise<void> => {
  try {
    const productStore = new ProductStore();
    const productId: string = req.params.id;
    const product = await productStore.show(productId);
    if (product !== null) {
      if (!productStore.isProductHasOrders(productId)) {
        const product = await productStore.delete(productId);
        if (product !== null) {
          resp.status(200).json({
            token: getToken(req),
            product: product,
          });
        } else {
          resp.status(404).json({
            message: `Product With Id: ${req.params.id} does not exist`,
          });
        }
      } else {
        resp.status(400).json({
          message: `Product With Id# ${productId} Cannot be deleted.`,
        });
      }
    } else {
      resp
        .status(404)
        .json({ message: `Product With Id: ${req.params.id} does not exist` });
    }
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
  app.put(
    '/api/products/:id',
    authenticate,
    body('product.name', 'product name field is required').notEmpty(),
    body('product.price', 'product price should be a number >= 0').isFloat({
      min: 0,
    }),
    update,
  );
  app.delete('/api/products/:id', authenticate, deleteProduct);
  //
  app.get('/api/products/category/:categoryName', getProductsByCategory);
  app.get('/api/top_products', getTopProducts);
};
