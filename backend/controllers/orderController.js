import Order from '../models/Order.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, subtotal, commission } = req.body;

    const order = await Order.create({
      userId: req.user.id,
      items,
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
