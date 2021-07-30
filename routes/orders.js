const {Router} = require('express')
const Order = require('../models/order')
const router = Router()
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({
            'user.userId': req.user._id
        }).populate('user.userId').lean()
        const temp = orders.map(o => {
            return {
                ...o,
                price: o.courses.reduce((total, c) => {
                    return total += c.count * c.course.price
                }, 0)
            }
        })
        
        res.render('orders', {
            isOrder: true,
            title: 'Orders',
            orders: temp
        })

    } catch (error) {
        console.log(error)
    }
   
})

router.post('/', auth, async (req, res) => {

    try {
        const user = await req.user.populate('cart.items.courseId').execPopulate()
        const courses = user.cart.items.map(i => ({
            count: i.count,
            course: {...i.courseId._doc}
        }))
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses: courses
        })
        console.log('order', order)
        await order.save()
        await req.user.clearCart()

        res.redirect('/orders')
    } catch (error) {
        console.log(error)
    }

})

module.exports = router