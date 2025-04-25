const Admin = require("../model/admin")

const isAdmin = async (req, res, next) => {
    try {
        console.log("Checking admin access for user ID:", req.user?.id)

        if (!req.user || !req.user.id) {
            console.log("Unauthorized access")
            return res.status(401).json({ message: "Unauthorized access" })
        }

        const admin = await Admin.findById(req.user.id)

        if (!admin) {
            console.log("Access forbidden")
            return res.status(403).json({ message: "Access forbidden" })
        }
        next()
    } catch (error) {
        console.error('Error checking admin status:', error.message)
        return res
            .status(500)
            .json({ message: 'Error checking admin status', error: error.message })
    }
}

module.exports = { isAdmin }