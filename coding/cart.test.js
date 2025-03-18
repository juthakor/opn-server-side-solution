const Cart = require('./cart');

describe('Cart Class', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
  });

  test('addProduct: should add a product with correct quantity, price, and freebie 0', () => {
    cart.addProduct(1, 3, 100);
    expect(cart.items[1]).toBeDefined();
    expect(cart.items[1].quantity).toEqual(3);
    expect(cart.items[1].price).toEqual(100);
    expect(cart.items[1].freebie).toEqual(0);
  });

  test('updateProduct: should update a product', () => {
    cart.addProduct(1, 3, 100);
    cart.updateProduct(1, 5, 150);
    expect(cart.items[1].quantity).toEqual(5);
    expect(cart.items[1].price).toEqual(150);
  });

  test('updateProduct: should throw error for non-existent product', () => {
    expect(() => cart.updateProduct(999, 5, 150)).toThrow('Product not found in cart');
  });

  test('removeProduct: should remove a product', () => {
    cart.addProduct(1, 3, 100);
    cart.removeProduct(1);
    expect(cart.items[1]).toBeUndefined();
  });

  test('removeProduct: should throw error for non-existent product', () => {
    expect(() => cart.removeProduct(999)).toThrow('Product not found in cart');
  });

  test('destroyCart: should clear all items and discounts', () => {
    cart.addProduct(1, 3, 100);
    cart.applyDiscount('TestDiscount', 'fixed', 50);
    cart.destroyCart();
    expect(Object.keys(cart.items).length).toEqual(0);
    expect(Object.keys(cart.discounts).length).toEqual(0);
  });

  test('productExists: should return true if product exists', () => {
    cart.addProduct(1, 3, 100);
    expect(cart.productExists(1)).toBe(true);
  });

  test('isEmpty: should return true for empty cart and false otherwise', () => {
    expect(cart.isEmpty()).toBe(true);
    cart.addProduct(1, 3, 100);
    expect(cart.isEmpty()).toBe(false);
  });

  test('listItems: should return all items in the cart', () => {
    cart.addProduct(1, 3, 100);
    const items = cart.listItems();
    expect(items[1].quantity).toEqual(3);
  });

  test('countUniqueItems: should return the correct count of unique products', () => {
    cart.addProduct(1, 3, 100);
    cart.addProduct(2, 2, 50);
    expect(cart.countUniqueItems()).toEqual(2);
  });

  test('totalItemsAmount: should return the total quantity of all products', () => {
    cart.addProduct(1, 3, 100);
    cart.addProduct(2, 2, 50);
    expect(cart.totalItemsAmount()).toEqual(5);
  });

  test('getCartTotal: should calculate total price excluding freebies', () => {
    cart.addProduct(1, 5, 100);
    cart.items[1].freebie = 2;

    expect(cart.getCartTotal()).toEqual(300);
  });

  test('applyDiscount (fixed): should apply fixed discount correctly', () => {
    cart.addProduct(1, 5, 100);
    cart.applyDiscount('FixedTest', 'fixed', 100);

    expect(cart.discounts['FixedTest']).toEqual(100);
  });

  test('applyDiscount (percentage): should apply percentage discount correctly', () => {
    cart.addProduct(1, 5, 100);
    cart.applyDiscount('PercentTest', 'percentage', 10, 100);

    expect(cart.discounts['PercentTest']).toEqual(50);
  });

  test('applyDiscount: fixed discount should not exceed cart total', () => {
    cart.addProduct(1, 5, 100);
    cart.applyDiscount('BigDiscount', 'fixed', 600);

    expect(cart.discounts['BigDiscount']).toEqual(500);
  });

  test('getDiscountTotal: should return the sum of all discounts', () => {
    cart.addProduct(1, 5, 100);
    cart.applyDiscount('Disc1', 'fixed', 100);
    cart.applyDiscount('Disc2', 'percentage', 10);

    expect(cart.getDiscountTotal()).toEqual(150);
  });

  test('getTotalAfterDiscounts: should calculate the total after discounts correctly', () => {
    cart.addProduct(1, 5, 100);
    cart.applyDiscount('Disc1', 'fixed', 100);

    expect(cart.getTotalAfterDiscounts()).toEqual(400);
  });

  test('applyFreebie: should increase freebie count for an existing product', () => {
    cart.addProduct(1, 5, 100);
    expect(cart.items[1].freebie).toEqual(0);
    
    cart.applyFreebie(1, 1, 2);
    expect(cart.items[1].freebie).toEqual(2);

    cart.applyFreebie(1, 1, 1);
    expect(cart.items[1].freebie).toEqual(3);
  });

  test('applyFreebie: should do nothing if condition product does not exist', () => {
    cart.addProduct(1, 5, 100);
    const initialFreebie = cart.items[1].freebie;

    cart.applyFreebie(2, 1, 2);

    expect(cart.items[1].freebie).toEqual(initialFreebie);
  });

  test('should correctly calculate total with freebies and fixed discount applied', () => {
    cart.addProduct(1, 5, 100);
 
    cart.applyFreebie(1, 1, 2);
  
    expect(cart.getCartTotal()).toEqual(300);
  
    cart.applyDiscount('FIXED', 'fixed', 50);

    expect(cart.getDiscountTotal()).toEqual(50);
    expect(cart.getTotalAfterDiscounts()).toEqual(250);
  });
  
  test('should correctly calculate total with freebies and percentage discount applied', () => {
    cart.addProduct(1, 5, 100);

    cart.applyFreebie(1, 1, 2);
    
    expect(cart.getCartTotal()).toEqual(300);
    
    cart.applyDiscount('PERCENT', 'percentage', 10);

    expect(cart.discounts['PERCENT']).toEqual(30);
    expect(cart.getTotalAfterDiscounts()).toEqual(270);
  });
});
