const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodoverride = require('method-override');
const uploads = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');


mongoose.Promise = global.Promise;

//dB connect
mongoose.connect('mongodb+srv://cms:123@cluster0-e5mut.mongodb.net/test?retryWrites=true&w=majority',{ useUnifiedTopology: true }).then(db=>{

console.log('DB connected');
}).catch(err => console.log('Error occur while connecting DB'));

//static for css,js
app.use(express.static(path.join(__dirname, 'public')));

//set view engine

const {select,GenerateTime} = require('./helpers/handlebars-helpers')
app.engine('handlebars',exphbs({ defaultLayout: 'home',helpers: {select: select, GenerateTime: GenerateTime}}));
app.set('view engine', 'handlebars');

//uploads
app.use(uploads());

//body parser
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());

//Method Override
app.use(methodoverride('_method'));

// session  

app.use(session({
    secret: 'gptheprogrammer',
    resave: true,
    saveUninitialized: true
}));

//passport login
app.use(passport.initialize());
app.use(passport.session());

//flash
app.use(flash());

// Local Variables using Middlewares
app.use((req, res, next)=>{
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
})

//routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');

//use routes
app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',posts);
app.use('/admin/categories',categories);

const port = process.env.PORT || 3000;
app.listen(port,()=>
{
    console.log(`listening to port ${port}`);
});  