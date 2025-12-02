import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, subtotal, commission } = req.body;

    // Ensure each item includes sellerId; if missing, look up from Product table
    const normalizedItems = await Promise.all(
      (items || []).map(async (it) => {
        try {
          const prodId = it.productId || it.id || it._id;
          if (!prodId) return it;
          const product = await Product.findByPk(prodId);
          if (!product) return it;

          // Build augmented item: preserve original properties but fill missing ones
          const newItem = { ...it };
          if (!newItem.sellerId && product.sellerId) newItem.sellerId = product.sellerId;
          if (!newItem.image && product.image) newItem.image = product.image;
          if ((!newItem.name || !newItem.price) && (product.name || product.price)) {
            if (!newItem.name && product.name) newItem.name = product.name;
            if (!newItem.price && typeof product.price !== 'undefined') newItem.price = product.price;
          }

          return newItem;
        } catch (err) {
          // ignore lookup errors and return original item
          return it;
        }
      })
    );

    const order = await Order.create({
      userId: req.user.id,
      items: normalizedItems,
      firstName: address?.firstName,
      lastName: address?.lastName,
      email: address?.email,
      street: address?.street,
      city: address?.city,
      state: address?.state,
      zipcode: address?.zipcode,
      country: address?.country,
      phone: address?.phone,
      paymentMethod,
      subtotal,
      commission,
      shippingFee: 40,
      total: subtotal + 40 + commission,
      paymentStatus: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by id
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ orderStatus, trackingNumber });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders for a seller (seller)
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });

    // Filter orders where any item belongs to this seller
    const sellerOrders = orders
      .map(order => {
        try {
          const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
          const sellerItems = items.filter(item => Number(item.sellerId) === Number(sellerId));
          if (sellerItems.length > 0) {
            // include a sellerItems property for frontend convenience
            return { ...order.toJSON(), sellerItems };
          }
        } catch (err) {
          return null;
        }
        return null;
      })
      .filter(Boolean);

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller: update order status for items that belong to this seller
export const updateOrderStatusBySeller = async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const { orderStatus } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check that this order has at least one item for this seller
    const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
    const hasSellerItem = items.some(item => Number(item.sellerId) === Number(sellerId));
    if (!hasSellerItem) return res.status(403).json({ message: 'Not authorized for this order' });

    // Update the orderStatus but don't allow sellers to set arbitrary admin-only fields
    await order.update({ orderStatus });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await order.update({ orderStatus: 'cancelled' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark order as received by the buyer
export const markOrderReceived = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only the buyer can mark as received
    if (order.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    // Only allow marking when status is shipped (avoid accidental marking)
    if (order.orderStatus !== 'shipped') return res.status(400).json({ message: 'Order must be shipped before marking as received' });

    await order.update({ orderStatus: 'completed', receivedAt: new Date() });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Seller: delete order if it belongs only to this seller
export const deleteOrderBySeller = async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
    if (!items.length) return res.status(400).json({ message: 'Order has no items' });

    // If any item is not owned by this seller, block deletion to avoid removing other's items
    const onlySellerItems = items.every(item => Number(item.sellerId) === Number(sellerId));
    if (!onlySellerItems) return res.status(403).json({ message: 'Order contains items from multiple sellers; cannot delete' });

    await order.destroy();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
