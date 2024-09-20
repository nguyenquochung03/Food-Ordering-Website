import jwt from 'jsonwebtoken'

const getId = async (req, res, next) => {
    const { token } = req.headers;

    if (token) {
        try {
            const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
            req.body.userId = tokenDecode.id;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.json({ success: false, message: "Token has expired. Please login again." });
            } else {
                console.log(error);
                return res.json({ success: false, message: 'Error' });
            }
        }
    } else {
        req.body.userId = null;
    }
    next();
}

export default getId