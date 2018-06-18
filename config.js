function ExtractJwt (req) {
    let token = null;
    if(req.cookies && req.cookies.token != void(0)) token = req.cookies['token']
    return token
}

module.exports = {
    jwt: {
        jwtFromRequest: ExtractJwt,
        secretOrKey: 'secretWord'
    },
    expiresIn: '1 day'
}