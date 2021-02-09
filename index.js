const express = require('express');
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const hbsHelpers = require('./utils/hbs-helpers.js');
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const varMiddleware = require('./middlewares/variables');
const userMiddleware = require('./middlewares/user');
const errorHandler = require('./middlewares/error');
const fileMiddleware = require('./middlewares/file');
const keys = require('./keys');

const app = express();

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: hbsHelpers
})
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({extended:false}));
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}));
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash())
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "cdnjs.cloudflare.com"],
      "object-src": ["'none'"],
      "style-src": ["'self'", "cdnjs.cloudflare.com"],
      "img-src": ["'self'","https:"],
      "font-src": ["'self'",'fonts.googleapis.com','fonts.gstatic.com','use.fontawesome.com','cdn. joinhoney.com']
    },
  }
}));
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  } catch (err) {
    console.log(err)
  }
}

start()