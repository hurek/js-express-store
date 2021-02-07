const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const User = require('./models/user');

const app = express();

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('602032830b6e3cc79c3b53ee');
    req.user = user;
    next();
  } catch (err) {
    console.log(err)
  }
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:false}));
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const url = `mongodb+srv://hurek:4qfPsODsdcq00Xh9@express-js-store.nx0fw.mongodb.net/express-js-store`
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    const candidate = await User.findOne();
    if (!candidate) {
      const user = new User({
        email: 'hurek@hurek.com',
        name: 'Hurek',
        cart: {items: []}
      })
      await user.save();
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  } catch (err) {
    console.log(err)
  }
}

start()