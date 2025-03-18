const Cart = require('./cart');

describe('Cart Service', () => {
    let cart;

    beforeEach(() => {
        cart = new Cart();
    });

    test('should add products to the cart', () => {
        cart.addProduct(1, 2, 100);

        expect(cart.items).toHaveProperty('1');
        expect(cart.items[1].quantity).toBe(2);
        expect(cart.items[1].price).toBe(100);
    });

    test('should update a product in the cart', () => {
        cart.addProduct(1, 2, 100);
        cart.updateProduct(1, 3, 100);

        expect(cart.items[1].quantity).toBe(3);
    });

    test('should throw an error when updating a non-existent product', () => {
        expect(() => cart.updateProduct(99, 1, 50)).toThrow('Product not found in cart');
    });

    test('should remove a product from the cart', () => {
        cart.addProduct(1, 2, 100);
        cart.removeProduct(1);

        expect(cart.items).not.toHaveProperty('1');
    });

    test('should throw an error when removing a non-existent product', () => {
        expect(() => cart.removeProduct(99)).toThrow('Product not found in cart');
    });

    test('should calculate the cart total correctly', () => {
        cart.addProduct(1, 2, 100);
        cart.addProduct(2, 1, 200);

        expect(cart.getCartTotal()).toBe(400);
    });

    test('should apply a percentage discount correctly with decimals', () => {
        cart.addProduct(1, 2, 100);
        cart.addProduct(2, 1, 200);
        cart.applyDiscount('SUMMER', 'percentage', 10.5, 50);
        const discountTotal = cart.getDiscountTotal();

        expect(typeof discountTotal).toBe('number');
        expect(discountTotal).toBeLessThanOrEqual(50);
        expect(discountTotal).toBeLessThanOrEqual(cart.getCartTotal());
    });

    test('should not allow a fixed discount to exceed the cart total', () => {
        cart.addProduct(1, 1, 50);
        cart.applyDiscount('BIGSALE', 'fixed', 100);

        expect(cart.getDiscountTotal()).toBe(50);
    });

    test('should calculate total after discounts correctly', () => {
        cart.addProduct(1, 2, 100);
        cart.applyDiscount('DISCOUNT', 'fixed', 50);

        expect(cart.getTotalAfterDiscounts()).toBe(150);
    });

    test('should apply a freebie product correctly', () => {
        cart.addProduct(1, 2, 100);
        cart.applyFreebie(1, 99);

        expect(cart.items).toHaveProperty('99');
        expect(cart.items[99].quantity).toBe(1);
        expect(cart.items[99].price).toBe(0);
        expect(cart.items[99].freebie).toBe(true);
    });
});
