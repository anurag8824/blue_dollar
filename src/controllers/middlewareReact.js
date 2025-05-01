const connection = require("../config/connectDB");

const middlewareReact = async(req, res, next) => {
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

    if (!auth || auth == "undefined") return res.status(205).json({msg:"you are not login",
        stauts:false
    });
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
            return res.status(305).json({msg:"you are not login",
                stauts:false
            });
        }
    } catch (error) {
        return res.status(305).json({msg:"you are not login",
            stauts:false
        });
    }
}

module.exports = middlewareReact;