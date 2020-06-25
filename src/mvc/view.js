var View = (function()
{
    var self =
    {
        GetSemesterData: function(dataRequest)
        {
            mainList = dataRequest(this.DrawSemesterScreen);
        },
        GetSemesterStats: function(dataRequest)
        {
            mainListStats = dataRequest(this.UpdateSemesterWithStats);
        },
        GetCourseData: function(dataRequest,semester)
        {
            if(!semester)semester = currentSemester;
            courseList = dataRequest(semester,self.DrawCourseScreen);
        },
        GetTaskData: function(dataRequest,semesterid)
        {
            if(!semesterid)semesterid = currentSemester.id;
            taskList = dataRequest(semesterid,self.UpdateCoursesWithTasks);
        },
        GetCourseTypes: function(dataRequest)
        {
            courseTypes = dataRequest();
        },
        GetTaskTypes: function(dataRequest)
        {
            taskTypes = dataRequest();
        },
        GetTaskStatuses: function(dataRequest)
        {
            taskStatuses = dataRequest();
        },
        Prepare: function(
            onSemesterInsertRequest,
            onSemesterDelteRequest,
            onCourseInsertRequest,
            onCourseDelteRequest,
            onTaskInsertRequest,
            onTaskDeleteRequest,
            onSwitchToSemesterScreen,
            onSwitchToCourseScreen)
        {
            // Semester
            insertSemesterRequest = onSemesterInsertRequest;
            deleteSemesterRequest = onSemesterDelteRequest;
            // Course
            insertCourseRequest = onCourseInsertRequest;
            deleteCourseRequest = onCourseDelteRequest;
            // Task
            insertTaskRequest = onTaskInsertRequest;
            deleteTaskRequest = onTaskDeleteRequest;

            // Switch Screens
            switchToSemesterScreen = onSwitchToSemesterScreen;
            switchToCourseScreen = onSwitchToCourseScreen;

            content = document.getElementById('content');
            header = document.querySelector('header');

            initTaskStatusColors();
            
        },
        DrawSemesterScreen: function()
        {
            ClearHeader();
            content.innerHTML = "";
    
            for(var i in mainList)
            {
                DrawSemesterBox(mainList[i]);
            }
    
            AddNewSemesterBox();
        },
        DrawCourseScreen: function(semester)
        {
            currentSemester = semester;
            DrawHeaderData();

            DrawSemesterOverview(semester);

            var course = null;
            for(var i in courseList)
            {
                course = {
                    id: courseList[i].id,
                    name: courseList[i].name,
                    kredit: courseList[i].kredit,
                    type: courseList[i].type,
                    semester: semester.id,
                    result: courseList[i].result
                }
                DrawCourseBox(course);
            }

            AddNewCourseBox(semester.id);
        },
        UpdateSemesterWithStats: function(stats)
        {
            if(!stats)stats = mainListStats;
            for(var i=0;i<mainList.length;i++)
            {
                var semester = mainList[i];
                var allCourse = 0;
                var doneCourse = 0;
                elementStat = document.getElementById('stat_'+semester.id);
                elementComp = document.getElementById('comp_'+semester.id);

                for(var j=0;j<stats.length;j++)
                {
                    var stat = stats[j];
                    if(stat.semester == semester.id)
                    {
                        allCourse = allCourse + 1;
                        if(stat.result)doneCourse = doneCourse + 1;
                    }
                }

                elementStat.innerHTML = ''+
                '<p class="box-header">Tárgyak</p>'+
                '<p class="box-data">'+doneCourse+'/'+allCourse+'</p>';

                if(allCourse == 0)
                {
                    elementComp.innerHTML = ''+
                    '<p class="box-header">Completion</p>'+
                    '<p class="box-data">0%</p>'+
                    '<div class="box-full right"></div>';
                }
                else
                {
                    elementComp.innerHTML = ''+
                    '<p class="box-header">Completion</p>'+
                    '<p class="box-data">'+Math.round((doneCourse/allCourse)*100)+'%</p>'+
                    '<div class="box-full right"></div>';
                }

            }
        },
        UpdateCoursesWithTasks: function(tasks)
        {
            if(!tasks)tasks = taskList;
            UpdateSemesterOverviewWithTasks(tasks);

            for(var i=0; i<courseList.length; i++)
            {
                var course = courseList[i];
                course.tasks = 1;
                course.firstTask = 0;
                UpdateTasksOfCourse(tasks,course);
            }
        },
    };

    // Header
    function DrawHeaderData()
    {
        header.innerHTML = "";
        var back = document.createElement('a');
        back.href="";
        back.innerHTML = '<div class="box-head left"></div>';

        back.onclick = function(e)
        {
            e.preventDefault();
            switchToSemesterScreen();
        }

        header.appendChild(back);
    }
    function ClearHeader()
    {
        header.innerHTML = "";
    }
    // Semester Screen
    function DrawSemesterBox(semester)
    {
        var currentElement = document.createElement('li');
        currentElement.className = "container";

        var editElement = document.createElement('a');
        editElement.className = "box edit";
        editElement.href="";

        editElement.onclick = function(e){
            e.preventDefault();
            DrawEditSemesterBox(
                currentElement,
                semester.id,
                semester.name,
                semester.school,
                semester.major
                );
        };

        currentElement.appendChild(editElement);

        var clickElement = document.createElement('a');
        clickElement.href="";

        clickElement.innerHTML = '<div class="longbox">'+
        '    <div class="box-halfline">'+
        '        <p class="box-halfline-text">'+semester.name+'</p>'+
        '    </div>'+
        '    <div class="box-quarterline">'+
        '        <p class="box-quarterline-text">'+semester.school+'</p>'+
        '    </div>'+
        '    <div class="box-quarterline">'+
        '        <p class="box-quarterline-text">'+semester.major+'</p>'+
        '    </div>'+
        '</div>'+
        '<div class="box" id="stat_'+semester.id+'">'+
        '    <p class="box-header">Tárgyak</p>'+
        '    <p class="box-data">X/X</p>'+
        '</div>'+
        '<div class="box hideif" id="comp_'+semester.id+'">'+
        '    <p class="box-header">Completion</p>'+
        '    <p class="box-data">X%</p>'+
        '    <div class="box-full right"></div>'+
        '</div>';

        clickElement.onclick = function(e){
            e.preventDefault();
            currentSemester = semester;
            switchToCourseScreen(semester)
        }

        currentElement.appendChild(clickElement);
        content.appendChild(currentElement);
    }
    function AddNewSemesterBox()
    {

        var currentElement = document.createElement('li');
        currentElement.className = "container";

        var linkElement = document.createElement('a');
        linkElement.href = "";

        var div = document.createElement('div');
        div.className = "box new";
        div.id = "addsemester";

        linkElement.appendChild(div);

        var title = document.createElement('p');
        title.className = "center-info";
        title.textContent = "Új félév";

        linkElement.appendChild(title);

        currentElement.appendChild(linkElement);
        content.appendChild(currentElement);

        linkElement.onclick = function(e)
        {
            e.preventDefault();
            DrawEditSemesterBox(currentElement);
        }

    }
    function DrawEditSemesterBox(
        li,
        id,
        name,
        school,
        major
        )
    {
        li.innerHTML = "";

        // Accept 
        var accept = document.createElement('a');
        accept.className="box accept";
        accept.href="";
        accept.onclick = function(e)
        {
            e.preventDefault();

            insertSemesterRequest(id,i_semester.value,i_school.value,i_major.value);

            //self.DrawSemesterScreen();
        }
        li.appendChild(accept);

        // Draw Form
        var form = document.createElement('form');
        form.className = "longbox";
        form.name = "editsemester";

        var div = null;

        // Draw Semester Name Input
        div = document.createElement('div');
        div.className = "box-halfline";

        var i_semester = document.createElement('input');
        i_semester.type = "text";
        i_semester.className = "box-halfline-text-i";
        if(name)i_semester.value = name;
        else i_semester.placeholder = "Félév";
        
        
        
        div.appendChild(i_semester);
        form.appendChild(div);

        // Draw School Name Input
        div = document.createElement('div');
        div.className = "box-quarterline";
        var i_school = document.createElement('input');
        i_school.type = "text";
        i_school.className = "box-quarterline-text-i";
        if(school)i_school.value = school;
        else i_school.placeholder="Egyetem";
        div.appendChild(i_school);
        form.appendChild(div);
        // Draw Major Input
        div = document.createElement('div');
        div.className = "box-quarterline";

        var i_major = document.createElement('input');
        i_major.type = "text";
        i_major.className = "box-quarterline-text-i";
        if(major)i_major.value = major;
        else i_major.placeholder="Szak";

        div.appendChild(i_major);
        form.appendChild(div);
        
        li.appendChild(form);

        
        // Cancel 
        var cancel = document.createElement('a');
        cancel.className="box cancel";
        cancel.href="";

        cancel.onclick = function(e)
        {
            e.preventDefault();
            self.DrawSemesterScreen();
            self.UpdateSemesterWithStats();
        }
        li.appendChild(cancel);

        // Delete
        var del = document.createElement('a');
        del.className="box delete";
        del.href="";

        del.onclick = function(e)
        {
            e.preventDefault();
            deleteSemesterRequest(id);
        }
        li.appendChild(del);
    }

    // Course Screen
    function DrawSemesterOverview(semester)
    {
        content.innerHTML = "";
        var currentElement = document.createElement('li');
        currentElement.className = "container-b";

        var allCourse = 0;
        var doneCourse = 0;
        var allKredit = 0;
        var doneKredit = 0;
        var avg = 0;
        var kki = 0;
        for(var i=0;i<courseList.length;i++)
        {
            var course = courseList[i];
            allKredit = allKredit + course.kredit
            allCourse = allCourse + 1;
            if(course.result)
            {
                if(course.kredit)kki = kki + (course.result * course.kredit);
                avg = avg + course.result;
                doneCourse = doneCourse + 1;
                doneKredit = doneKredit + course.kredit;
            }
        }
        if(allCourse>0)avg = (avg / allCourse).toFixed(2);
        else avg = 0;

        if(allKredit>0 && doneKredit>0)kki = (kki/30*allKredit/doneKredit).toFixed(2);
        else kki = 0;

        

        currentElement.innerHTML = ''+
        '<div class="longbox">'+
        '        <div class="box-halfline">'+
        '            <p class="box-halfline-text">'+semester.name+'</p>'+
        '        </div>'+
        '        <div class="box-quarterline">'+
        '            <p class="box-quarterline-text">'+semester.school+'</p>'+
        '        </div>'+
        '        <div class="box-quarterline">'+
        '            <p class="box-quarterline-text">'+semester.major+'</p>'+
        '        </div>'+
        '    </div>'+
        '    <div class="box" id="tasks_'+semester.id+'">'+
        '        <div class="box-text">'+
        '            <p class="box-header">Task</p>'+
        '            <p class="box-header-right">Total</p>'+
        '            <p class="box-header-right">Left</p>'+
        '        </div>'+
        '        <div class="box-text">'+
        '            <p class="box-text-header">ZH</p>'+
        '            <p class="box-text-right">0</p>'+
        '            <p class="box-text-right">0</p>'+
        '        </div>'+
        '        <div class="box-text">'+
        '            <p class="box-text-header">Bead</p>'+
        '            <p class="box-text-right">0</p>'+
        '            <p class="box-text-right">0</p>'+
        '        </div>'+
        '        <div class="box-text">'+
        '            <p class="box-text-header">Vizsga</p>'+
        '            <p class="box-text-right">0</p>'+
        '            <p class="box-text-right">0</p>'+
        '        </div>'+
        '        <div class="box-text">'+
        '            <p class="box-text-header">All</p>'+
        '            <p class="box-text-right">0</p>'+
        '            <p class="box-text-right">0</p>'+
        '        </div>'+
        '    </div>'+
        '    <div class="box" id="stat_'+semester.id+'">'+
        '        <div class="box-text">'+
        '            <p class="box-header">Stats</p>'+
        '        </div>'+
        '        <div class="box-text">'+
        '            <p class="box-text-header">Kredit</p>'+
        '            <p class="box-text-right">'+doneKredit+'/'+allKredit+'</p>'+
        '        </div>'+
        '        <div class="box-text">'+
        '            <p class="box-text-header">Tárgy</p>'+
        '            <p class="box-text-right">'+doneCourse+'/'+allCourse+'</p>'+
        '        </div>'+
        '        <div class="box-text">'+
        '            <p class="box-text-header">Átlag</p>'+
        '            <p class="box-text-right">'+avg+'</p>'+
        '        </div>'+
        '        <div class="box-text">'+
        '            <p class="box-text-header">KKI</p>'+
        '            <p class="box-text-right">'+kki+'</p>'+
        '        </div>'+
        '    </div>'+
        '    <div class="box" id="comp_'+semester.id+'">'+
        '        <p class="box-header">Completion</p>'+
        '        <p class="box-data">70%</p>'+
        '    </div>'

        content.appendChild(currentElement);
    }
    function DrawCourseBox(course)
    {
        var currentElement = document.createElement('li');
        currentElement.className = "container-b";

        var div;
        var div2;

        div = document.createElement('div');
        div.className = "longbox-x";

        div2 = document.createElement('div');
        div2.className = "box-halfline-o";

        div2.innerHTML = '<div class="longbox-xx-f">'+
        '    <p class="box-header">'+courseTypes[course.type-1].name+'</p>'+
        '    <p class="box-halfline-text-b">'+course.name+'</p>'+
        '</div>';

        var editBox = document.createElement('a');
        editBox.className="box-b edit";
        editBox.href="";

        editBox.onclick = function(e){
            e.preventDefault();
            DrawEditCourseBox(currentElement,course.semester,course);
        };
        div2.appendChild(editBox);
        div.appendChild(div2);


        div2 = document.createElement('div');
        div2.className = "box-halfline-o";
        div2.id = 'c_'+course.id;

        div.appendChild(div2);

        currentElement.appendChild(div);

        div = document.createElement('div');
        div.className = "smallbox";
        div.innerHTML ='<div class="box-halfline-o">'+
        '           <p class="box-header">Kredit</p>'+
        '           <p class="box-data">'+course.kredit+'</p>'+
        '        </div>'+
        '        <div href="" class="box-halfline-o">'+
        '            <p class="box-header">Jegy</p>'+
        '            <p class="box-data">'+course.result+'</p>'+
        '        </div>'+
        currentElement.appendChild(div);

        div = document.createElement('div');
        div.className = "box";
        div.id = 'c_tasks_'+course.id;
        div.innerHTML ='<p class="box-header">Tasks</p>'+
        '        <p class="box-data">26/36</p>';
        currentElement.appendChild(div);

        div = document.createElement('div');
        div.className = "box";
        div.id = 'c_comp_'+course.id;
        div.innerHTML ='<p class="box-header">Completion</p>'+
        '        <p class="box-data">50%</p>';
        currentElement.appendChild(div);

        content.appendChild(currentElement);
    }
    function DrawEditCourseBox(li,semesterid,course)
    {
        li.innerHTML = "";

        // Draw Accept Box
        var accept = document.createElement('a');
        accept.className="box accept";
        accept.href="";
        accept.onclick = function(e)
        {
            e.preventDefault();
            if(!course)
            {
                course = {
                    id: "",
                    name: cName.value,
                    type: cType.value,
                    kredit: cKredit.value,
                    result: cResult.value,
                    semester: semesterid
                };
            }
            else
            {
                course.name = cName.value;
                course.type = cType.value;
                course.kredit = cKredit.value;
                course.result = cResult.value;
            }
            insertCourseRequest(course);
        }
        li.appendChild(accept);

        // Draw Form
        var form = document.createElement('form');
        form.className = "longbox";
        form.name = "editcourse";

        var div = null;
        var div2 = null;

        div = document.createElement('div');
        div.className = "longbox-xx-f";

        div2 = document.createElement('div');
        div2.className = "box-quarterline";

        var cType = document.createElement('select');
        cType.className = "box-quarterline-text-select"; 

        for(var i in courseTypes)
        {
            cType.innerHTML = cType.innerHTML +
            '<option value="'+courseTypes[i].id+'">'+courseTypes[i].name+'</option>'
        }
        if(course)cType.value = course.type;

        div2.appendChild(cType);
        div.appendChild(div2);

        div2 = document.createElement('div');
        div2.className = "box-halfline";

        var cName = document.createElement('input');
        cName.className = "box-halfline-text-i";
        cName.type = "text";
        cName.form = "editcourse";
        if(course)cName.value = course.name;
        else cName.placeholder = "Tárgy";

        div2.appendChild(cName);
        div.appendChild(div2);
        form.appendChild(div);

        div = document.createElement('div');
        div.className = "smallbox-x";

        div2 = document.createElement('div');
        div2.className = "box-halfline-o";

        div2.innerHTML = '<p class="box-header">Kredit</p>';

        var cKredit = document.createElement('input');
        cKredit.className = "box-data-i";
        cKredit.type = "text";
        cKredit.form = "editcourse";
        cKredit.title = "Kredit";
        if(course)cKredit.value = course.kredit;

        div2.appendChild(cKredit);
        div.appendChild(div2);

        div2 = document.createElement('div');
        div2.className = "box-halfline-o";

        div2.innerHTML = '<p class="box-header">Jegy</p>';

        var cResult = document.createElement('input');
        cResult.className = "box-data-i";
        cResult.type = "text";
        cResult.form = "editcourse";
        cResult.title = "Jegy";
        if(course)cResult.value = course.result;

        div2.appendChild(cResult);
        div.appendChild(div2);
        form.appendChild(div);
        
        li.appendChild(form);
        
        // Draw Cancel Box
        var cancel = document.createElement('a');
        cancel.className="box cancel";
        cancel.href="";

        cancel.onclick = function(e)
        {
            e.preventDefault();
            self.DrawCourseScreen(currentSemester);
            self.UpdateCoursesWithTasks();
        }
        li.appendChild(cancel);

        // Draw Delete Box
        var del = document.createElement('a');
        del.className="box delete";
        del.href="";

        del.onclick = function(e)
        {
            e.preventDefault();
            deleteCourseRequest(course.id);
        }
        li.appendChild(del);
    }
    function AddNewCourseBox(semesterid)
    {

        var currentElement = document.createElement('li');
        currentElement.className = "container";

        var linkElement = document.createElement('a');
        linkElement.href = "";

        var div = document.createElement('div');
        div.className = "box new";
        div.id = "addsemester";

        linkElement.appendChild(div);

        var title = document.createElement('p');
        title.className = "center-info";
        title.textContent = "Új tantárgy";

        linkElement.appendChild(title);

        currentElement.appendChild(linkElement);
        content.appendChild(currentElement);

        linkElement.onclick = function(e)
        {
            e.preventDefault();
            DrawEditCourseBox(currentElement,semesterid);
        }

    }
    function UpdateSemesterOverviewWithTasks(tasks)
    {

        var stats = document.getElementById('tasks_'+currentSemester.id);
        
        var allZH = 0;
        var doneZH = 0;
        var allBead = 0;
        var doneBead = 0;
        var allVizsga = 0;
        var doneVizsga = 0;
        var all = 0;
        var done = 0;

        for(var i=0;i<tasks.length;i++)
        {
            var task = tasks[i];
            switch (task.type) {
                case 1:
                        allZH = allZH + 1;
                        if(task.done)doneZH = doneZH + 1;
                    break;
                case 2:
                        allBead = allBead + 1;
                        if(task.done)doneBead = doneBead + 1;
                    break;
                case 3:
                        allVizsga = allVizsga + 1;
                        if(task.done)doneVizsga = doneVizsga + 1;
                    break;
            
                default:
                    break;
            }
            if(task.done==1)done = done + 1;
            all = all + 1;
        }
        
        
        stats.innerHTML = ''+
        '<div class="box-text">'+
        '    <p class="box-header">Task</p>'+
        '    <p class="box-header-right">Total</p>'+
        '    <p class="box-header-right">Left</p>'+
        '</div>'+
        '<div class="box-text">'+
        '   <p class="box-text-header">ZH</p>'+
        '    <p class="box-text-right">'+allZH+'</p>'+
        '    <p class="box-text-right">'+(allZH-doneZH)+'</p>'+
        '</div>'+
        '<div class="box-text">'+
        '    <p class="box-text-header">Bead</p>'+
        '    <p class="box-text-right">'+allBead+'</p>'+
        '    <p class="box-text-right">'+(allBead-doneBead)+'</p>'+
        '</div>'+
        '<div class="box-text">'+
        '    <p class="box-text-header">Vizsga</p>'+
        '    <p class="box-text-right">'+allVizsga+'</p>'+
        '    <p class="box-text-right">'+(allVizsga-doneVizsga)+'</p>'+
        '</div>'+
        '<div class="box-text">'+
        '    <p class="box-text-header">All</p>'+
        '    <p class="box-text-right">'+all+'</p>'+
        '    <p class="box-text-right">'+(all-done)+'</p>'+
        '</div>';
        
        var comp = document.getElementById('comp_'+currentSemester.id);

        if(all == 0)
        {
            comp.innerHTML = ''+
            '<p class="box-header">Completion</p>'+
            '<p class="box-data">0%</p>';
        }
        else
        {
            comp.innerHTML = ''+
            '<p class="box-header">Completion</p>'+
            '<p class="box-data">'+Math.round((done/all)*100)+'%</p>';
        }
    }
    // Course Screen Tasks
    function DrawTaskLeft(course)
    {
        var clickArrow = document.createElement('a');
        clickArrow.href = "";
        clickArrow.className = "box-fixed-half left-b";

        clickArrow.onclick = function(e){
            e.preventDefault();
            if(course.firstTask>0)
            {
                course.firstTask = course.firstTask - 1;
                UpdateTasksOfCourse(taskList,course);
            }
        }

        ccElement.appendChild(clickArrow);
    }
    function DrawTaskRight(course)
    {
        var clickArrow = document.createElement('a');
        clickArrow.href = "";
        clickArrow.className = "box-fixed-half right-b";

        clickArrow.onclick = function(e){
            e.preventDefault();
            if(course.firstTask+5<coruse.tasks)
            {
                course.firstTask = course.firstTask + 1;
                UpdateTasksOfCourse(taskList,course);
            }
        }
        ccElement.appendChild(clickArrow);
    }
    function DrawTaskBox(task,course)
    {
        if(!task.result)task.result="";
        var taskBox = document.createElement('a');
        taskBox.href = "";
        taskBox.className = "box-fixed-small";
        taskBox.id = 'task_'+task.id;

        taskBox.innerHTML = '<div class="box-quarterline">'+
        '   <p class="box-quarterline-text-b text-small">'+task.name+'</p>'+
        '</div>'+
        '<div class="box-quarterline">'+
        '    <p class="box-quarterline-text-b text-small-half">'+taskTypes[task.type-1].name+'</p>'+
        '</div>'+
        '<div class="box-halfline">'+
        '        <p class="'+taskStatusColors[task.status]+' locked"></p>'+
        '</div>'+
        '<p class="box-data">'+task.result+'</p>';

        taskBox.onclick = function(e)
        {
            e.preventDefault();
            // course.tasks = course.tasks + 2;
            // course.firstTask = course.firstTask + 2;
            // console.log('C Tasks: '+course.tasks);
            // console.log('C Firsttask: '+course.firstTask);
            DrawEditTaskBox(course,this,task);
            // var myid = taskBox.id;
            // console.log('CourseTasks '+course.tasks);
            // UpdateTasksOfCourse(taskList,course);
            // var editThis = ccElement.querySelector('#'+myid);
            // DrawEditTaskBox(course,editThis,task);
        }

        ccElement.appendChild(taskBox);
    }
    function DrawNewTaskBox(course)
    {
        var newTask = document.createElement('a');
        newTask.href = "";
        newTask.className = "box-fixed-small new";

        newTask.onclick = function(e)
        {
            e.preventDefault();
            // course.tasks = course.tasks + 2;
            // course.firstTask = course.firstTask + 2;
            // console.log('C Tasks: '+course.tasks);
            // console.log('C Firsttask: '+course.firstTask);
            DrawEditTaskBox(course,newTask);
        }

        ccElement.appendChild(newTask);
    }
    function DrawEditTaskBox(course,box,task)
    {
        if(!task)
        {
            task = {
                id: "",
                name: "",
                type: 1,
                status: 1,
                course: course.id,
                result: null
            }
        }

        box.innerHTML = "";
        box.className = "box-fixed-small-3x";
        box.onclick = function(e)
        {
            e.preventDefault();
        }

        // First Line
            var div = document.createElement('div');
            div.className = "box-quarterline";

            var iName = document.createElement('input');
            iName.className="box-quarterline-text-b-i";
            iName.type = "text";
            iName.placeholder = "Feladat név";
            if(task.id)iName.value = task.name;

            div.appendChild(iName);

            // Accept
            var button = document.createElement('a');
            button.href="";
            button.className="box-b-fixed accept";

            button.onclick = function(e){
                e.preventDefault();

                task.name = iName.value;
                task.result = parseInt(iResult.value);
                // course.tasks = course.tasks - 2;

                insertTaskRequest(task);

            }
            div.appendChild(button);

            // Cancel
            button = document.createElement('a');
            button.href="";
            button.className="box-b-fixed cancel";

            button.onclick = function(e){
                e.preventDefault();
                // course.tasks = course.tasks - 2;
                UpdateTasksOfCourse(taskList,course)
            }
            div.appendChild(button);

            // Delete
            button = document.createElement('a');
            button.href="";
            button.className="box-b-fixed delete";

            button.onclick = function(e){
                e.preventDefault();
                // course.tasks = course.tasks - 2;
                deleteTaskRequest(task.id);
            }
            div.appendChild(button);

        box.appendChild(div);

        // Task Type
            div = document.createElement('div');
            div.className = "box-quarterline";

            DrawTaskTypes(div,task);

            box.appendChild(div);

        // Task Status
            div = document.createElement('div');
            div.className = "box-halfline";

            DrawTaskStatuses(div,task);

        box.appendChild(div);

        // Task Result
        var iResult = document.createElement('input');
        iResult.type="text";
        iResult.title="Eredmény";
        iResult.className="box-data-i2";
        if(task.result)iResult.value=task.result;

        box.appendChild(iResult);
        
    }
    function UpdateTasksOfCourse(tasks,course)
    {
        if(course)
        {
            ccElement = document.getElementById('c_'+course.id);
            ccElement.innerHTML = "";

            var allTask = 0;
            var doneTask = 0;

            for(var j=0; j<tasks.length;j++)
            {
                var task = tasks[j];
                if(task.course == course.id)
                {
                    course.tasks = course.tasks + 1;
                    allTask = allTask + 1;
                    if(task.done)doneTask = doneTask + 1;
                }
            }


            taskElement = document.getElementById('c_tasks_'+course.id);
            compElement = document.getElementById('c_comp_'+course.id);

            taskElement.innerHTML = ''+
            '<p class="box-header">Tasks</p>'+
            '<p class="box-data">'+doneTask+'/'+allTask+'</p>'

            if(allTask == 0)
            {
                compElement.innerHTML = ''+
                '<p class="box-header">Completion</p>'+
                '<p class="box-data">0%</p>';
            }
            else
            {
                compElement.innerHTML = ''+
                '<p class="box-header">Completion</p>'+
                '<p class="box-data">'+Math.round((doneTask/allTask)*100)+'%</p>';
            }

            if(!course.tasks)
            {
                DrawTaskLeft(course);
                for(var j=course.firstTask; j<course.firstTask+6;j++)
                {
                    var task = tasks[j];
                    if(task.course == course.id)
                    {

                        DrawTaskBox(task,course);
                    }
                }
                DrawNewTaskBox(course);
                DrawTaskRight(course);

            }
            else
            {
                for(var j=0; j<tasks.length;j++)
                {
                    var task = tasks[j];
                    if(task.course == course.id)
                    {
                        DrawTaskBox(task,course);
                    }
                }
                DrawNewTaskBox(course);
            }
    }

    }
    function DrawTaskTypes(parent,task)
    {
        parent.innerHTML = "";

        for(var i=0;i<taskTypes.length;i++)
        {
            var tType = taskTypes[i];
            var button = document.createElement('a');
            button.href=tType.id;
            button.text = tType.name;
            if(parseInt(button.getAttribute("href")) == task.type)
            {
                button.className="listlink selected";
                button.addEventListener("click",function(e){
                    e.preventDefault();
                })
            }
            else
            {
                button.className="listlink";
                button.onclick = function(e){
                    e.preventDefault();
                    task.type = parseInt(this.getAttribute("href"))
                    DrawTaskTypes(parent,task);
                }
            }
            parent.appendChild(button);
        }
    }
    function DrawTaskStatuses(parent,task)
    {
        parent.innerHTML = "";

        var tStatus = [];
        var button = null;

        // Empty
        tStatus = taskStatuses[0];
        button = document.createElement('a');
        button.href = tStatus.id;
        button.title = "Később";
        if(task.status == tStatus.id)button.className = "status empty yes";
        else
        {
            button.className = "status empty";
            button.onclick = function(e){
                e.preventDefault();
                task.status = parseInt(this.getAttribute("href"));
                DrawTaskStatuses(parent,task);
            }
        }
        parent.appendChild(button);
        // Failed
        tStatus = taskStatuses[1];
        button = document.createElement('a');
        button.href = tStatus.id;
        button.title = "Kész - Sikertelen";
        if(task.status == tStatus.id)button.className = "status failed yes";
        else
        {
            button.className = "status failed";
            button.onclick = function(e){
                e.preventDefault();
                task.status = parseInt(this.getAttribute("href"));
                DrawTaskStatuses(parent,task);
            }
        }
        parent.appendChild(button);
        // WIP
        tStatus = taskStatuses[2];
        button = document.createElement('a');
        button.href = tStatus.id;
        button.title = "Dolgozom Rajta";
        if(task.status == tStatus.id)button.className = "status wip yes";
        else
        {
            button.className = "status wip";
            button.onclick = function(e){
                e.preventDefault();
                task.status = parseInt(this.getAttribute("href"));
                DrawTaskStatuses(parent,task);
            }
        }
        parent.appendChild(button);
        // Done
        tStatus = taskStatuses[3];
        button = document.createElement('a');
        button.href = tStatus.id;
        button.title = "Kész";
        if(task.status == tStatus.id)button.className = "status done yes";
        else
        {
            button.className = "status done";
            button.onclick = function(e){
                e.preventDefault();
                task.status = parseInt(this.getAttribute("href"));
                DrawTaskStatuses(parent,task);
            }
        }
        parent.appendChild(button);
        // Success
        tStatus = taskStatuses[4];
        button = document.createElement('a');
        button.href = tStatus.id;
        button.title = "Kész - Sikeres";
        if(task.status == tStatus.id)button.className = "status success yes";
        else
        {
            button.className = "status success";
            button.onclick = function(e){
                e.preventDefault();
                task.status = parseInt(this.getAttribute("href"));
                DrawTaskStatuses(parent,task);
            }
        }
        parent.appendChild(button);

    }

    // Other
    function initTaskStatusColors()
    {
        taskStatusColors[1]="status empty";
        taskStatusColors[2]="status failed";
        taskStatusColors[3]="status wip";
        taskStatusColors[4]="status done";
        taskStatusColors[5]="status success";

        // taskStatusColors.push("status failed");
        // taskStatusColors.push("status wip");
        // taskStatusColors.push("status done");
        // taskStatusColors.push("status success");
    }

    var insertSemesterRequest = null;
    var deleteSemesterRequest = null;
    var insertCourseRequest = null;
    var deleteCourseRequest = null;
    var insertTaskRequest = null;
    var deleteTaskRequest = null;

    var switchToSemesterScreen = null;
    var switchToCourseScreen = null;

    var mainList = [];
    var mainListStats = [];
    var currentSemester = null;
    var elementStat = null;
    var elementComp = null;

    var courseList = [];
    var courseTypes = [];
    var ccElement = null;

    var taskList = [];
    var taskTypes = [];
    var taskStatuses = [];

    var taskStatusColors =[];

    var content = null;

    return self;
})();