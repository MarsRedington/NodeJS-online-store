const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const csrf = require('csurf')// защита сессий
const flash = require('connect-flash') //сообщения об ошибках
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const helmet = require('helmet')

const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const keys = require('./keys')


const app = express();
const PORT = process.env.PORT || 3000;
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers'),
    allowedProtoMethods: {
        trim: true
      }
})

const store = new MongoStore({
    collection: 'session',
    uri: keys.MONGODB_URL
})

app.engine('hbs', hbs.engine); 

app.set('view engine', 'hbs');
app.set('views', 'views');


app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}))
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(helmet({
    contentSecurityPolicy: {
       directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": ["'self'", "https:"],
          "script-src": ["'self'", "https:"],
       },
    },
   }))
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses',coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler)



app.get('/about', (req, res) => {
    res.render('about',{
        title: "About page"
    })
})

async function start(){
    try{
        await mongoose.connect(keys.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false })
        app.listen(PORT, ()=>{
            console.log(`Server starrrted... on port ${PORT}`)
        })
    } catch (e){
        console.log(e)
    } 
}

start()

