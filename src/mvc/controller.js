var Controller = (function()
{
    var self =
    {
        Prepare: function()
        {
            Model.Prepare()

            View.Prepare(
                InsertRequestToSemester,
                DeleteRequestToSemester,
                InsertRequestToCourse,
                DeleteRequestToCourse,
                InsertRequestToTask,
                DeleteRequestToTask,
                self.SemesterActivity,
                self.CourseActivity);
            View.GetCourseTypes(Model.GetCourseTypes);
            View.GetTaskStatuses(Model.GetTaskStatuses);
            View.GetTaskTypes(Model.GetTaskTypes);  

        },
        SemesterActivity: function()
        {
            View.GetSemesterData(Model.GetSemesterData);
            View.GetSemesterStats(Model.UpdateSemesterStats);
        },
        CourseActivity: function(semester)
        {
            if(courseFirst)
            {
                View.GetCourseTypes(Model.GetCourseTypes);
                View.GetTaskStatuses(Model.GetTaskStatuses);
                View.GetTaskTypes(Model.GetTaskTypes);  
                courseFirst = !courseFirst;
            }
            View.GetCourseData(Model.GetCourseData,semester);
            View.GetTaskData(Model.GetTaskData,semester.id);
        }
    };

    // Semester
    function InsertRequestToSemester(id,name,school,major)
    {
        if(id)
        {
            Model.UpdateSemester(id,name,school,major)
        }
        else
        {
            if(name)Model.InsertNewSemester(name,school,major);
        }
        View.GetSemesterData(Model.GetSemesterData);
        View.GetSemesterStats(Model.UpdateSemesterStats);
    }
    function DeleteRequestToSemester(id)
    {
        if(id)Model.DeleteSemester(id)
        View.GetSemesterData(Model.GetSemesterData);
        View.GetSemesterStats(Model.UpdateSemesterStats);
    }
    // Course
    function InsertRequestToCourse(course)
    {
        if(course.id)
        {
            Model.UpdateCourse(course)
        }
        else
        {
            if(course.name)Model.InsertNewCourse(course);
            
        }
        View.GetCourseData(Model.GetCourseData);
        View.GetTaskData(Model.GetTaskData);
    }
    function DeleteRequestToCourse(id)
    {
        if(id)Model.DeleteCourse(id)
        View.GetCourseData(Model.GetCourseData);
        View.GetTaskData(Model.GetTaskData);
    }
    // Taks
    function InsertRequestToTask(task)
    {
        if(task.id)Model.UpdateTask(task);
        else Model.InsertNewTask(task);
        View.GetTaskData(Model.GetTaskData);
    }
    function DeleteRequestToTask(id)
    {
        if(id)Model.DeleteTask(id)
        View.GetTaskData(Model.GetTaskData);
    }

    var courseFirst = true;

    return self;
})();