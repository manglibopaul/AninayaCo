// CustomRequest controller removed. The custom request feature is disabled.
// If any routes still call these functions they will receive a 410 response from the route layer.

export const createCustomRequest = async (req, res) => res.status(410).json({ message: 'Custom request feature removed' })
export const getUserCustomRequests = async (req, res) => res.status(410).json({ message: 'Custom request feature removed' })
export const getSellerCustomRequests = async (req, res) => res.status(410).json({ message: 'Custom request feature removed' })
export const getCustomRequestById = async (req, res) => res.status(410).json({ message: 'Custom request feature removed' })
export const addMessageToRequest = async (req, res) => res.status(410).json({ message: 'Custom request feature removed' })
export const postQuote = async (req, res) => res.status(410).json({ message: 'Custom request feature removed' })
export const acceptQuote = async (req, res) => res.status(410).json({ message: 'Custom request feature removed' })
export const updateRequestStatus = async (req, res) => res.status(410).json({ message: 'Custom request feature removed' })
