import jwt from "jsonwebtoken";
const authMiddleware = (req, res, next)=> {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({
                success: false,
                message: "token is required",
            });
        }
        const token = authHeader.startsWith("Bearer")
        ? authHeader.split(" ")[1]
        : null;
        
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Invalid authentication format",
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Auth middlewere error", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expirey token",
        });
    }
};
export default authMiddleware;