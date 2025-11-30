module.exports.isAuthenticated = (req,res,next) => {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/login');
};
module.exports.isAdmin = (req,res,next) => {
  if (req.session && req.session.usuario && req.session.usuario.tipo_usuario === 'ADMIN') return next();
  return res.status(403).send('Acesso negado');
};
