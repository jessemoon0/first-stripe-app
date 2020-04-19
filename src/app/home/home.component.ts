import { Component, OnInit } from '@angular/core';
import { Course } from '../interfaces/course';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CoursesService } from '../services/courses.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public courses$: Observable<Course[]>;
  public beginnersCourses$: Observable<Course[]>;
  public advancedCourses$: Observable<Course[]>;
  public processingOngoing = false;

    constructor(private coursesService: CoursesService) {}

  public ngOnInit() {
    this.reloadCourses();
  }

  public reloadCourses() {
    this.courses$ = this.coursesService.loadAllCourses();
    this.beginnersCourses$ = this.courses$.pipe(
        map(courses => courses.filter(
          course => course.categories.includes('BEGINNER'))));
    this.advancedCourses$ = this.courses$.pipe(
        map(courses => courses.filter(
            course => course.categories.includes('ADVANCED'))));
  }

  public subscribeToPlan() {
    
  }

}
