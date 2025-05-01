const connection = require("../config/connectDB");

const middlewareController = async(req, res, next) => {
    // xác nhận token
    console.log("Inside auth function ghjkvbnmkvbjkl")
    const auth = req.cookies.auth;
    console.log(auth)
    console.log(auth)

    console.log(auth)

    console.log(auth)

    console.log(auth)

    console.log(auth)

    console.log(auth)

    if (!auth || auth == "undefined") return res.redirect("http://localhost:4000/login");
    try {
        const [rows] = await connection.execute('SELECT `token`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1', [auth]);
        if(!rows) {
            res.clearCookie("auth");
            return res.end();
        };
        if (auth == rows[0].token && rows[0].status == '1') {
            console.log("Hello world Hahhahahah")
            next();
        } else {
            return res.redirect("/login");
        }
    } catch (error) {
        return res.redirect("/login");
    }
}

module.exports = middlewareController;