const {Router} = require('express');
const Course = require('../models/course');
const router = Router();
const {validationResult} = require('express-validator')
const {courseValidators} = require('../utils/validators')
const auth = require('../middleware/auth')

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res)=>{
    try {
            const courses = await Course.find().populate('userId').lean();
    res.render('courses', {
        title: "Courses page",
        isCourses: true,
        userId: req.user ? req.user._id.toString() : null,
        courses
    })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/edit', auth, async (req, res) => {
    if(!req.query.allow){
        return res.redirect('/')
    }
    try {
        const course = await Course.findById(req.params.id).lean()
        if (!isOwner(course, req)){
            return res.redirect('/courses')
        }
        res.render('courseedit', {
        title:`Редактировать ${course.title}`,
        course
    })
    } catch (error) {
        console.log(error)
    }

})

router.post('/edit', auth, courseValidators, async (req, res)=> {
    const errors = validationResult(req)
    const {id} = req.body
    if(!errors.isEmpty()){
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
    try {
        // const {id} = req.body
        delete req.body.id // убрали тк мангус сам добавляет свой id
        const course = await Course.findById(id)
        if(!isOwner(course, req)){
            return res.redirect('/course')
        }
        Object.assign(course, req.body)
        await course.save()
        // await Course.findByIdAndUpdate(id, req.body).lean()
        res.redirect('/courses') 
    } catch (error) {
        console.log(error)
    }
})

router.post('/remove', auth, async (req, res)=> {
    // console.log("req.id", req.params)
    try {
        //  console.log("req.id", req.body.id)
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }    
})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean()
        res.render('course', {
            layout: 'empty',
            title: `Course ${course.title}`,
            course
        })
    } catch (error) {
        console.log(error)
    }
    
})

module.exports = router