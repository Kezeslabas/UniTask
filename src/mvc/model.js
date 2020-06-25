var Model = (function()
{
    var self =
    {
        Prepare: function()
        {
            initDatabase();
            Maintenance();
        },
        // Semester
        InsertNewSemester: function(name,school,major)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'INSERT INTO semester (NAME,SCHOOL,MAJOR) VALUES (?,?,?)',
                        [name,school,major],
                        null,
                        function(){console.log("Insert Semester Failed")}
                    );
                }
             );
        },
        UpdateSemester: function(id,name,school,major)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'UPDATE semester SET NAME=?, SCHOOL=?, MAJOR=? WHERE ID=?',
                        [name,school,major,id],
                        null,
                        function(){console.log("Update Semester Failed")}
                        );
                    }
                 );
        },
        DeleteSemester: function(id)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'DELETE FROM semester WHERE ID=?',
                        [id],
                        null,
                        function(){console.log("Delete Semester Failed")}
                        );
                    }
                 );
            DeleteSemesterCourses(id);
        },
        GetSemesterData: function (DrawOut)
        {
            var list = [];
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'SELECT * FROM semester',
                        [],
                        function(tr,result){
                            for(var i=0; i< result.rows.length; i++)
                            {
                                var record = result.rows.item(i);
                                list.push({
                                    id: record.ID,
                                    name: record.NAME,
                                    school: record.SCHOOL,
                                    major: record.MAJOR
                                });
                            }
                            DrawOut();
                        }
                    );
                }
             );
             return list;
        },
        UpdateSemesterStats: function(DrawOut)
        {
            var list = [];
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'SELECT SEMESTER_ID, RESULT FROM course',
                        [],
                        function(tr,result){
                            for(var i=0; i< result.rows.length; i++)
                            {
                                var record = result.rows.item(i);
                                list.push({
                                    semester: record.SEMESTER_ID,
                                    result: record.RESULT
                                });
                            }
                            DrawOut(list);
                        }
                    );
                }
             );
             return list;
        },
        // Course
        GetCourseData: function (semester,DrawOut)
        {
            var list = [];
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'SELECT * FROM course WHERE SEMESTER_ID=?',
                        [semester.id],
                        function(tr,result){
                            for(var i=0; i< result.rows.length; i++)
                            {
                                var record = result.rows.item(i);
                                list.push({
                                    id: record.ID,
                                    name: record.NAME,
                                    kredit: record.KREDIT,
                                    type: record.COURSE_TYPE_ID,
                                    semester: record.SEMESTER_ID,
                                    result: record.RESULT,
                                    tasks: 1,
                                    firstTask: 0
                                });
                            }
                            DrawOut(semester);
                        }
                    );
                }
             );
             return list;
        },
        InsertNewCourse: function(course)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'INSERT INTO course (NAME,KREDIT,SEMESTER_ID,COURSE_TYPE_ID,RESULT) VALUES (?,?,?,?,?)',
                        [
                            course.name,
                            course.kredit,
                            course.semester,
                            course.type,
                            course.result
                        ],
                        null,
                        function(){console.log("Insert Course Failed")}
                    );
                }
             );
        },
        UpdateCourse: function(course)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'UPDATE course SET NAME=?, KREDIT=?, COURSE_TYPE_ID=?, SEMESTER_ID=?, RESULT=? WHERE ID=?',
                        [
                            course.name,
                            course.kredit,
                            course.type,
                            course.semester,
                            course.result,
                            course.id
                        ],
                        null,
                        function(){console.log("Update Course Failed")}
                        );
                    }
                 );
        },
        DeleteCourse: function(id)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'DELETE FROM course WHERE ID=?',
                        [id],
                        DeleteCourseTasks(id),
                        function(){console.log("Delete Course Failed")}
                        );
                    }
                 );
        },
        GetCourseTypes: function()
        {
            var list = [];
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'SELECT * FROM course_type',
                        [],
                        function(tr,result){
                            for(var i=0; i< result.rows.length; i++)
                            {
                                var record = result.rows.item(i);
                                list.push({
                                    id: record.ID,
                                    name: record.NAME,
                                });
                            }
                        }
                    );
                }
             );
             return list;
        },
        // Task
        InsertNewTask: function(task)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'INSERT INTO task (NAME,TASK_TYPE_ID,TASK_STATUS_ID,COURSE_ID,RESULT) VALUES (?,?,?,?,?)',
                        [
                            task.name,
                            task.type,
                            task.status,
                            task.course,
                            task.result
                        ],
                        null,
                        function(){console.log("Insert Task Failed")}
                    );
                }
             );
        },
        UpdateTask: function(task)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'UPDATE task SET NAME=?, TASK_TYPE_ID=?, TASK_STATUS_ID=?, COURSE_ID=?, RESULT=? WHERE ID=?',
                        [
                            task.name,
                            task.type,
                            task.status,
                            task.course,
                            task.result,
                            task.id
                        ],
                        null,
                        function(){console.log("Update Task Failed")}
                        );
                    }
                 );
        },
        DeleteTask: function(id)
        {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'DELETE FROM task WHERE ID=?',
                        [id],
                        null,
                        function(){console.log("Delete Task Failed")}
                        );
                    }
                 );
        },
        GetTaskData: function(semesterid,DrawOut)
        {// WIP
            var list = [];
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'SELECT task_status.DONESIGNAL, task.ID, task.NAME, task.TASK_TYPE_ID, task.TASK_STATUS_ID, task.COURSE_ID, task.RESULT '+
                        'FROM task_status LEFT JOIN task '+
                        'ON task.TASK_STATUS_ID = task_status.ID '+
                        'LEFT JOIN course '+
                        'ON course.ID = task.COURSE_ID WHERE course.SEMESTER_ID = ?',
                        [semesterid],
                        function(tr,result){
                            for(var i=0; i< result.rows.length; i++)
                            {
                                var record = result.rows.item(i);
                                list.push({
                                    id: record.ID,
                                    name: record.NAME,
                                    type: record.TASK_TYPE_ID,
                                    status: record.TASK_STATUS_ID,
                                    course: record.COURSE_ID,
                                    result: record.RESULT,
                                    done: record.DONESIGNAL
                                });
                            }
                            DrawOut(list);
                        }
                    );
                }
             );
             return list;
        },
        GetTaskStatuses: function()
        {
            var list = [];
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'SELECT * FROM task_status',
                        [],
                        function(tr,result){
                            for(var i=0; i< result.rows.length; i++)
                            {
                                var record = result.rows.item(i);
                                list.push({
                                    id: record.ID,
                                    name: record.NAME,
                                    done: record.DONESIGNAL
                                });
                            }
                        }
                    );
                }
             );
             return list;
        },
        GetTaskTypes: function()
        {
            var list = [];
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'SELECT * FROM task_type',
                        [],
                        function(tr,result){
                            for(var i=0; i< result.rows.length; i++)
                            {
                                var record = result.rows.item(i);
                                list.push({
                                    id: record.ID,
                                    name: record.NAME,
                                });
                            }
                        }
                    );
                }
             );
             return list;
        }
    };


    function initDatabase()
    {
        db = openDatabase(
            databaseName,
            versionNumber,
            textDescription,
            estimatedSizeOfDatabase
        );
        db.transaction(
            function(transaction) {
                //transaction.executeSql('DROP TABLE course',null,function(){console.log('Drop Succeeded');},function(){console.log('Drop Failed');});

                transaction.executeSql(
                    'CREATE TABLE IF NOT EXISTS "semester" ("ID"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,"NAME"	TEXT NOT NULL,"SCHOOL"	TEXT,"MAJOR"	TEXT)'
                );
                transaction.executeSql(
                    'CREATE TABLE IF NOT EXISTS "course" ('+
                    '    "ID"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,'+
                    '    "NAME"	TEXT NOT NULL,'+
                    '    "KREDIT"	INTEGER NOT NULL,'+
                    '    "SEMESTER_ID"	INTEGER NOT NULL,'+
                    '    "COURSE_TYPE_ID"	INTEGER,'+
                    '    "RESULT"	INTEGER'+
                    ')'
                );
                transaction.executeSql(
                    'CREATE TABLE IF NOT EXISTS "course_type" ("ID"	INTEGER NOT NULL UNIQUE,"NAME"	TEXT NOT NULL UNIQUE,PRIMARY KEY("ID"))',
                    [],fillCourseTypes()
                );
                transaction.executeSql(
                    'CREATE TABLE IF NOT EXISTS "task_type" ("ID"	INTEGER NOT NULL UNIQUE,"NAME"	TEXT NOT NULL UNIQUE,PRIMARY KEY("ID"))',
                    [],fillTaskTypes()
                );
                transaction.executeSql(
                    'CREATE TABLE IF NOT EXISTS "task_status" ("ID"	INTEGER NOT NULL UNIQUE,"NAME"	TEXT NOT NULL UNIQUE,"DONESIGNAL"	INTEGER,PRIMARY KEY("ID"))',
                    [],fillTaskStatus()
                );
                transaction.executeSql(
                    'CREATE TABLE IF NOT EXISTS "task" ('+
                    '    "ID"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,'+
                    '    "NAME"	REAL NOT NULL,'+
                    '    "TASK_TYPE_ID"	INTEGER NOT NULL,'+
                    '    "TASK_STATUS_ID"	INTEGER NOT NULL,'+
                    '    "COURSE_ID"	INTEGER NOT NULL,'+
                    '    "RESULT"	INTEGER'+
                    ')'
                );
            }
         );
    }
    function fillCourseTypes()
    {
        db.transaction(
            function(transaction) {
                transaction.executeSql('INSERT INTO "course_type" VALUES (?,?)',
                [1,"Kötelező"]);
                transaction.executeSql('INSERT INTO "course_type" VALUES (?,?)',
                [2,"Szabadon Választható"]);
                transaction.executeSql('INSERT INTO "course_type" VALUES (?,?)',
                [3,"Kötelezően választható"]);
            }
        );
    }
    function fillTaskTypes()
    {
        db.transaction(
            function(transaction) {
                transaction.executeSql('INSERT INTO "task_type" VALUES (?,?)',
                [1,"ZH"]);
                transaction.executeSql('INSERT INTO "task_type" VALUES (?,?)',
                [2,"BEAD"]);
                transaction.executeSql('INSERT INTO "task_type" VALUES (?,?)',
                [3,"VIZSGA"]);
            }
        );
    }
    function fillTaskStatus()
    {
        db.transaction(
            function(transaction) {
                transaction.executeSql('INSERT INTO "task_status" VALUES (?,?,?)',
                [1,"Később",0]);
                transaction.executeSql('INSERT INTO "task_status" VALUES (?,?,?)',
                [2,"Nem Sikerült",1]);
                transaction.executeSql('INSERT INTO "task_status" VALUES (?,?,?)',
                [3,"Dolgozom Rajta",0]);
                transaction.executeSql('INSERT INTO "task_status" VALUES (?,?,?)',
                [4,"Kész",1]);
                transaction.executeSql('INSERT INTO "task_status" VALUES (?,?,?)',
                [5,"Sikerült",1]);
            }
        );
    }
    function DeleteSemesterCourses(semesterid)
    {
        db.transaction(
            function(transaction) {
                transaction.executeSql(
                    'SELECT ID FROM course WHERE SEMESTER_ID=?',
                    [semesterid],
                    function(tr,result){
                        for(var i=0; i< result.rows.length; i++)
                        {
                            DeleteCourseTasks(result.rows.item(i).ID);
                        }
                    }
                );
            }
        );
        db.transaction(
            function(transaction) {
                transaction.executeSql(
                    'DELETE FROM course WHERE SEMESTER_ID=?',
                    [semesterid],
                    null,
                    function(){console.log("Delete Course Failed")}
                    );
                }
            );
    }
    function DeleteCourseTasks(courseid)
    {
        db.transaction(
            function(transaction) {
                transaction.executeSql(
                    'DELETE FROM task WHERE COURSE_ID=?',
                    [courseid],
                    null,
                    function(){console.log("Delete Task Failed")}
                    );
                }
            );
    }
    function Maintenance()
    {
        // db.transaction(
        //     function(transaction) {
        //         transaction.executeSql(
        //             'DELETE FROM course WHERE SEMESTER_ID=?',
        //             ["undefined"],
        //             null,
        //             function(){console.log("Maintenance failed")}
        //             );
        //         }
        //     );
    }


    var databaseName = 'UniTaskDB';
    var versionNumber = '1.0';
    var textDescription = 'my first database';
    var estimatedSizeOfDatabase = 2 * 1024 * 1024;
    var db;
    // var dbPath = '../../data/data.db';
    // var db;

    return self;
})();