module.exports = function(req,res,next){
  const token = req.headers['x-admin-token'] || req.cookies?.admin_token;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    if (req.originalUrl.startsWith('/admin') && req.method === 'GET') return res.redirect('/admin/login');
    return res.status(401).send('Unauthorized - invalid admin token');
  }
  next();
};
