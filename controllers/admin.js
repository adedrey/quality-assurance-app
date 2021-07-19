const Student = require('../models/student');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Admin = require('../models/auth');
const ITEMS_PER_PAGE = 3;
const bcrypt = require('bcryptjs');
let totalItems;
const {
    validationResult
} = require("express-validator");
exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    Student.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts
            return Student.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            
        })
        .then(result => {
            res.render('admin/posts', {
                path: '/admin/posts',
                pagetitle: 'AFIT-QAS Dashboard',
                reports: result,
                totalProducts  : totalItems,
                currentPage : page,
                hasNextPage : ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage : page > 1,
                nextPage : page + 1,
                previousPage : page - 1,
                lastPage : Math.ceil(totalItems / ITEMS_PER_PAGE)
            })
        })
        .catch(err => {
            return next(new Error(err))
        })


}
exports.getReport = (req, res, next) => {
    const reportId = req.params.reportId; 
    Student.findById(reportId)
        .then(report => {
            if (!report) {
                return next(new Error("Unable to locate file"));
            }
            const reportName = 'report' + reportId + '.pdf';
            const reportPath = path.join('data', 'reports', reportName);
            const pdfDoc = new PDFDocument();
            res.setHeader('Content-type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + reportId + '"');
            pdfDoc.pipe(fs.createWriteStream(reportPath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(12).text('Restricted', {
                align: 'center'
            });
            pdfDoc.moveDown();
            pdfDoc.fontSize(15).text('AirForce Institute of Technology', {
                align: 'center'
            });
            pdfDoc.fontSize(15).text('Quality Assurance Unit', {
                align: 'center'
            });
            pdfDoc.moveDown();
            pdfDoc.fontSize(14).text('MEMORANDUM', {
                align: 'left'
            });
            pdfDoc.moveDown();
            pdfDoc.fontSize(14).text('FOR           :       Officer in Charge', {
                align: 'left'
            });
            pdfDoc.fontSize(14).text('                          Wing Commander Name', {
                align: 'left'
            });
            pdfDoc.fontSize(14).text('                          Wing Commander', {
                align: 'left'
            });
            pdfDoc.moveDown();
            pdfDoc.fontSize(14).text(`SUBJECT     :    Report Re: Alleged ${report.subject}`, {
                align: 'left'
            });
            pdfDoc.moveDown();
            pdfDoc.fontSize(14).text(`DATE          :   ${report.date}`, {
                align: 'left'
            });
            pdfDoc.text('___________________________________________________________')
            pdfDoc.moveDown();
            pdfDoc.text(`Sender Name:`);
            pdfDoc.text(`${report.name}`, {
                align: 'center'
            });
            pdfDoc.text('Sender Department: ');
            pdfDoc.text(`${report.department}`, {
                align: 'center'
            });
            pdfDoc.text('Sender level: ')
            pdfDoc.text(`${report.level}`, {
                align: 'center'
            });
            pdfDoc.moveDown();
            pdfDoc.text('MATTER TO INVESTIGATE', {
                align: 'center',
                underline: true
            });
            pdfDoc.moveDown();
            pdfDoc.text('Message: ');
            pdfDoc.text(`${report.message}`, {
                align: 'left'
            });
            pdfDoc.moveDown();
            pdfDoc.moveDown();
            pdfDoc.moveDown();
            pdfDoc.fontSize(12).text('Restricted', {
                align: 'center',

            });

            pdfDoc.end();
        })
        .catch(err => {
            return next(new Error(err));
        })
}

exports.getProfile = (req, res, next) => {
    res.render('admin/profile', {
        path: '/admin/profile',
        pagetitle: 'Manage Profile',
        validationCSS: [],
        errorMessage: null,
        oldValue: {
            password: '',
            newPassword: '',
            confirmPassword: ''
        }
    })
}
exports.postProfile = (req, res, next) => {
    const password = req.body.password;
    const newPassword = req.body.newpassword;
    const confirmPassword = req.body.confirmpassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/profile', {
            path: '/admin/profile',
            pagetitle: 'Change Settings',
            oldValue: {
                password: password,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            },
            validationCSS: errors.array(),
            errorMessage: errors.array()[0].msg
        })
    }
    Admin.findOne({
            _id: req.user._id
        })
        .then(user => {
            if (!user) {
                return res.status(422).render('/admin/login', {
                    path: '/admin/login',
                    pagetitle: 'AFIT Login',
                    errorMessage: 'Data/Session lost. Please Login again.',
                });
            }

            return bcrypt.hash(newPassword, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    return user.save();
                })
                .catch(err => {
                    console.log(err);
                })

        })
        .then(result => {
            return res.status(201).render('admin/profile', {
                path: '/admin/profile',
                pagetitle: 'Change Settings',
                oldValue: {
                    password: '',
                    newPassword: '',
                    confirmPassword: ''
                },
                validationCSS: [],
                errorMessage: 'Password changed successfully'
            })
        })
        .catch(err => {
            return next(new Error(err));
        })

}