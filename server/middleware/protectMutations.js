const protect = require("./auth");

// Public reads stay open. Admin writes require a JWT.
function protectMutations(req, res, next) {
    if (req.method === "GET") {
        return next();
    }

    return protect(req, res, next);
}

module.exports = protectMutations;
