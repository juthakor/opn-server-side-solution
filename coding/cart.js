class Cart {
    constructor() {
        this.items = {};
        this.discounts = {};
    }

    addProduct(productId, quantity, price) {
        if (this.items[productId]) {
            this.items[productId].quantity += quantity;
        } else {
            this.items[productId] = { quantity, price, freebie: 0 };
        }
    }

    updateProduct(productId, quantity, price) {
        if (this.items[productId]) {
            this.items[productId].quantity = quantity;
            this.items[productId].price = price;
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
            const item = this.items[productId];
            
            const finalQuantity = Math.max(item.quantity - item.freebie, 0);
            total += finalQuantity * item.price;
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

    applyFreebie(conditionProductId, productId, freebieAmount = 1) {
        if (this.productExists(conditionProductId)) {
            if (this.items[productId]) {
                let currentFreebie = this.items[productId].freebie;
                let newFreebie = currentFreebie + freebieAmount;
            
                this.items[productId].freebie = newFreebie;
            }
        }
    }
}

module.exports = Cart;
