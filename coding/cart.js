class Cart {
    constructor() {
        this.items = {};
        this.discounts = {};
    }

    addProduct(productId, quantity, price) {
        if (this.items[productId]) {
            this.items[productId].quantity += quantity;
        } else {
            this.items[productId] = { quantity, price };
        }
    }

    updateProduct(productId, quantity, price) {
        if (this.items[productId]) {
            this.items[productId] = { quantity, price };
        } else {
            throw new Error('Product not found in cart');
        }
    }

    removeProduct(productId) {
        if (this.items[productId]) {
            delete this.items[productId];
        } else {
            throw new Error('Product not found in cart');
        }
    }

    destroyCart() {
        this.items = {};
        this.discounts = {};
    }

    productExists(productId) {
        return !!this.items[productId];
    }

    isEmpty() {
        return Object.keys(this.items).length === 0;
    }

    listItems() {
        return this.items;
    }

    countUniqueItems() {
        return Object.keys(this.items).length;
    }

    totalItemsAmount() {
        return Object.values(this.items).reduce((total, item) => total + item.quantity, 0);
    }

    getCartTotal() {
        let total = 0;

        for (let productId in this.items) {
            total += this.items[productId].quantity * this.items[productId].price;
        }

        return total;
    }

    applyDiscount(name, type, amount, maxAmount = Infinity) {
        const total = this.getCartTotal();
        let discountValue = 0;

        if (type === 'fixed') {
            discountValue = amount;
        } else if (type === 'percentage') {
            discountValue = (total * amount) / 100;

            discountValue = parseFloat(discountValue.toFixed(2));
            if (discountValue > maxAmount) {
                discountValue = maxAmount;
            }
        }

        if (discountValue > total) {
            discountValue = total;
        }

        this.discounts[name] = discountValue;
    }

    removeDiscount(name) {
        delete this.discounts[name];
    }

    getDiscountTotal() {
        return Object.values(this.discounts).reduce((sum, d) => sum + d, 0);
    }

    getTotalAfterDiscounts() {
        const totalAfter = this.getCartTotal() - this.getDiscountTotal();
        return totalAfter < 0 ? 0 : totalAfter;
    }

    applyFreebie(conditionProductId, freebieProductId, freebiePrice = 0) {
        if (this.productExists(conditionProductId)) {
            if (!this.items[freebieProductId]) {
                this.items[freebieProductId] = { quantity: 1, price: freebiePrice, freebie: true };
            }
        }
    }
}

module.exports = Cart