
import {COURSES, findLessonsForCourse} from './db-data';

import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyD0BzZnVyUOSkafRRDPHrmPUlCqMZxcl2I',
  authDomain: 'stripe-tutorial-7f929.firebaseapp.com',
  databaseURL: 'https://stripe-tutorial-7f929.firebaseio.com',
  projectId: 'stripe-tutorial-7f929',
  storageBucket: 'stripe-tutorial-7f929.appspot.com',
  messagingSenderId: '727823752627',
  appId: '1:727823752627:web:ce5ee7e17f81b1a3193fc6'
};

console.log('Uploading data to the database with the following config:\n');

console.log(JSON.stringify(config));

console.log('\n\n\n\nMake sure that this is your own database, so that you have write access to it.\n\n\n');

firebase.initializeApp(config);

const db = firebase.firestore();

async function uploadData() {

  const batch = db.batch();

  const courses = db.collection('courses');


  Object.values(COURSES)
    .sort((c1: any, c2: any) => c1.seqNo - c2.seqNo)
    .forEach(async (course: any) => {

      const newCourse = removeId(course);

      const courseRef = await courses.add(newCourse);

      const lessons = courseRef.collection('lessons');

      const courseLessons = findLessonsForCourse(course.id);

      // console.log(`Adding ${courseLessons.length} lessons to ${course.description}`);

      courseLessons.forEach(async lesson => {

        const newLesson = removeId(lesson);

        await lessons.add(newLesson);

      });

    });

  return batch.commit();
}


function removeId(data: any) {

  const newData: any = {...data};

  delete newData.id;

  return newData;
}


uploadData()
  .then(() => {
    console.log('Writing data, exiting in 10 seconds ...\n\n');

    setTimeout(() => {

      console.log('\n\n\nData Upload Completed.\n\n\n');
      process.exit(0);

    }, 10000);

  })
  .catch(err => {
    console.log('Data upload failed, reason:', err, '\n\n\n');
    process.exit(-1);
  });


