
const studentsModel = require('../Models/studentsModel');
const coursesModel = require('../Models/coursesModel');
const gradesModel = require('../Models/gradesModel');
const xlsx = require('xlsx');



const generateExcelFile = () => {
    return new Promise((resolve, reject) => {
      // Fetch all students
      studentsModel.getAllStudents((err, students) => {
        if (err) {
          reject(err);
          return;
        }
  
        // Fetch all grades
        gradesModel.getAllGrades((err, grades) => {
          if (err) {
            reject(err);
            return;
          }
  
          // Fetch all courses
          coursesModel.getAllCourses((err, courses) => {
            if (err) {
              reject(err);
              return;
            }
  
            // Map grades to students
            const studentsWithGrades = students.map((student) => {
              const studentGrades = grades.filter((grade) => grade.National_ID === student.National_ID);
              const studentCourses = studentGrades.map((grade) => {
                const course = courses.find((course) => course.Course_Name === grade.Course_Name);
                return {
                  Course_Name: grade.Course_Name,
                  Grade: grade.Grade,
                  Year_Work: grade.Year_Work,
                  Full_Grade: grade.Full_Grade,
                  Practical_Exams_Grade: grade.Practical_Exams_Grade,
                  Written_Exams_Grade: grade.Written_Exams_Grade,
                  Course_ID: course.Course_ID,
                  Course_Type: course.Course_Type,
                  Course_Term: course.Course_Term,
                };
              });
  
              return {
                National_ID: student.National_ID,
                Student_Name: student.Student_Name,
                Courses: studentCourses,
              };
            });
  
            // Create worksheet data
            const worksheetData = studentsWithGrades.flatMap((student) => {
              return student.Courses.map((course) => {
                return {
                  'National ID': student.National_ID,
                  'Student Name': student.Student_Name,
                  'Course Name': course.Course_Name,
                  Grade: course.Grade,
                  'Year Work': course.Year_Work,
                  'Full Grade': course.Full_Grade,
                  'Practical Exams Grade': course.Practical_Exams_Grade,
                  'Written Exams Grade': course.Written_Exams_Grade,
                };
              });
            });
  
            // Create worksheet
            const worksheet = xlsx.utils.json_to_sheet(worksheetData);
            const workbook = {
              Sheets: { 'Students with Grades': worksheet },
              SheetNames: ['Students with Grades'],
            };
  
            // Generate file path and save workbook
            const filePath = 'students_with_grades.xlsx';
            xlsx.writeFile(workbook, filePath);
            resolve(filePath);
          });
        });
      });
    });
  };
module.exports = generateExcelFile;