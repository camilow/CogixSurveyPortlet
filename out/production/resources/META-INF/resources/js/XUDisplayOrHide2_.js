var ShowAndHide_copyright="Copyright (c) 2007-2011 Cogix Corporation - may only be used as part of licensed Cogix software. Decompilation prohibited.";

var bdebugging = false;
/*
Status: As of 9:13 Sunday, basic old behavior restored
Disable now working and it is preserving values beautifully, as well as defaults. THIS IS WHAT ELY NEEDED ALL ALONG

Interesting... disable/invisible makes no sense...
What we need instead is:  leave the visibility setting alone,
but introduce reset/disable instead,which hasto do with whether to remove values or with setting the control to disabled
(and reenabling it later) -- which can all be done inside ResetElement!!!

options available in 1st line
qname: disable|invisible  nonehide|noneshow  otherhide|othershow
// the last two have been implemented, but never tested.
// the first one has never been tested or implemented and it is needed now

 */
var DOH_copyright="Copyright (c) 2006-2011 Cogix Corporation - may only be used as part of licensed Cogix software. Decompilation prohibited.";
var CogixModuleIdentifier = "XUDisplayOrHide2_.js";

function ShowAndHide_Specification () {   //  constructor; AKA onoffspec
    this.pivotname = '';	        //	name of pivot element (radio group, select-one, checkbox )
    this.pivottype = '';           //  radio,checkbox,select-one,text
    this.pivotlength = 0;        //   1 for input box, more for others
    this.conditions = new Object();     //	associative array of ShowAndHide_Condition, one per value
    //  set by getDefaults():
    this.resetmethod = 'r';       //  i(nvisible) or d(isable)
    this.noneaction = 'h';       // show or hide affected when nothing selected
    this.otheraction = 'h';      //  show or hide affected when no affected action specified

    this.theform = null;        // the Form object
    this.thespecquestion = null;    //  name of the specification question

    //  Added in 70
    this.visibilitytracker = null;
    this.hiddenquestions = null;    // replaces old global window object, now obsolete
    this.hidechildren = false;  //  synonym for recursive DoH

    this.hidemethod = 'h';      //  what to do with hidden elements; h=hide with CSS; d=disable controls

    function getDefaults ( s ) {
        if ( !s ) return;
        var optionstring = ShowAndHide_Trim ( s );
        if ( optionstring.length < 1 ) return;
        var options = optionstring.split(/[, ]/) ;
        for ( var op = 0; op < options.length; op++ ) {
            var o = options [op];
            switch ( o ) {
                //  What to do with hidden  element's values:
                case 'remove':   //  remove: after hiding elements, remove their values and don't restore them
                    this.resetmethod = 'r';
                    break;
                case 'preserve':   //  after hiding elements, leave their values in place and enable the elements (don't remove)
                    this.resetmethod = 'p';
                    break;
                /*
                case 'disable':   //  disable:  after hiding elements, leave their values in place but disable the elements
                    this.resetmethod = 'd';
                    break;
                */
                case 'restore':   //  better synonym for disable; does NOT send to server !!!
                    this.resetmethod = 'd';
                    break;

                case 'hidechildren':
                case 'recursive':   //  much better synonym for hidechildren
                case 'nested':      //  better yet
                    this.hidechildren = true;
                    break;

                case 'disablehidden':
                case 'disable':  //  make hidden elements disabled
                    this.hidemethod = 'd';
                break;
                case 'hidehidden':  //  make hidden elements invisible
                    this.hidemethod = 'h';
                break;

/* never implemented
                case 'resetchildren':
                    this.resetchildren = true;
                    break;
                case 'disablechildren':
                    this.disablechildren = true;
                    break;
*/
                case 'nonehide':
                    this.noneaction='h';
                    break;
                case 'showatstart':
                case 'noneshow':
                    this.noneaction='s';
                    break;
                case 'otherhide':
                    this.otheraction = 'h';
                    break;
                case 'othershow':
                    this.otheraction = 's';
                    break;
                default:
            }
        }
    }
    this.getDefaults = getDefaults;
}

function ShowAndHide_Condition () {   //  constructor AKA condition
    this.value = null;  //	value of the pivot element
    this.affects = '';   //  list of qnames that are affected (displayed) when this value is selected
}

function ShowAndHide_QuestionSpec (pivotelmt, qname) {    //  constructor
    this.pivottype = null;
    this.pivotlength = 0;
    this.qname = qname;

    var bhastype = false;
    try {
        bhastype = pivotelmt.type != null;
    } catch ( ignored) {}
    if ( bhastype && pivotelmt.type ) { //  if it has a type, either input or select-one
        this.pivottype = pivotelmt.type ;
        this.pivotlength = pivotelmt.length ? pivotelmt.length : 1;
    }
    else {  //  either radio or checkbox
        this.pivottype = pivotelmt[0].type;
        this.pivotlength = pivotelmt.length;
    }
}

function ShowAndHide_IsFirefox () {
    return navigator.userAgent.indexOf ("Firefox" ) >= 0 ;
}

function ShowAndHide_Setup( theform, specquestion ) {
    //if ( debugging () ) console.log ("ShowAndHide_Setup: ", specquestion);
    //	break up input into constituents
    if ( typeof window.ShowAndHide_Specs  == 'undefined' )
        window.ShowAndHide_Specs = new Object ();
    if ( typeof window.ShowAndHide_SavedHandler  == 'undefined' )
        window.ShowAndHide_SavedHandler = new Object ();
    if ( typeof window.vwfEventsListObject  == 'undefined' )
        window.vwfEventsListObject = new vwfEventsList ();

    var theq = eval ( "theform."+specquestion  ) ;
    var formulii = theq.value;

    var onoffspec = null; // ShowAndHide_Specification

    var formulas = formulii.split(/[;\n]/);	//  matches semicolon orend of line
    for ( var ff = 0; ff < formulas.length; ff ++ ) {
        var formula = formulas[ff]; //  .replace(/\n/,'') ;   // perhaps should be /$/ instead of /\n/
        formula = ShowAndHide_Trim  ( formula );
        if ( vwfShowAndHide_StartsWith ( formula, "#") || vwfShowAndHide_StartsWith ( formula, "//" ) )   //   allow # and // as comments
            continue;
        if (formula != "" ) {
            var parts = formula.split("=");
            if ( parts.length == 1 ) {
                if ( onoffspec != null ) {
                    if ( ShowAndHide_AddSpec ( theform, onoffspec ) )
                        return;
                }
                onoffspec = new ShowAndHide_Specification();
                onoffspec.theform = theform;
                onoffspec.thespecquestion  = specquestion;
                //	This is the first line, which defines the question being interrogated (the 'pivot' question)
                //  Format is qname, qname,qname : option,option,option ( no equal sign)
                var pivotquestion = formula;
                var qspecs = formula.split (":");
                if ( qspecs.length > 1 ) {
                    pivotquestion = qspecs [0];
                    onoffspec.getDefaults (qspecs[1] );
                }
// alert ( formula + ' | ' + pivotquestion );  HMMM last:last comes out last:last | last AHA a colon is special case, referring to the options!!!
                if ( pivotquestion.indexOf(' ') > 0 ) {
                    //  A blank -- probably forgot the equal sign
                    alert ( "DisplayOrHide - This is not a question name:'" + pivotquestion + "'. Likely cause: forgotten equal sign?" );
                    return;
                }
                var pivotelmt = theform.elements [ pivotquestion ] ;    //  cannot use document.getElementById (onoffobj.pivotname );
                if ( ! pivotelmt ) {
                    alert ( "DisplayOrHide - Cannot find question named '" + pivotquestion + "'. Likely cause:  Misspelling?  Is the DisplayOrHide question located before the conditional question it uses? Wrong case?" );
                    return;
                }
                onoffspec.pivotname = pivotquestion;	//	just the qname = element name
                var bhastype = false;
                try {
                    bhastype = pivotelmt.type != null;
                } catch ( ignored) {}
                if ( bhastype && pivotelmt.type ) { //  if it has a type, either input or select-one
                    onoffspec.pivottype = pivotelmt.type ;
                    onoffspec.pivotlength = pivotelmt.length ? pivotelmt.length : 1;
                }
                else {  //  either radio or checkbox
                    //                    alert ( '*'+onoffspec.pivotname +'='+ pivotelmt) ;
                    onoffspec.pivottype = pivotelmt[0].type;
                    onoffspec.pivotlength = pivotelmt.length;
                }
            }
            else if ( parts.length > 1 ) {
                //	Format: value value,value = question,question,question1-question2,...
                var lhs = ShowAndHide_Trim  ( parts [0] );
                var rhs = ShowAndHide_Trim  ( parts [1] );

                if ( lhs == "-none" && "radio" !=  onoffspec.pivottype  && "select-one"  !=  onoffspec.pivottype ) {
                    alert ("DisplayOrHide --   -none can ony be used  with a radio button or dropdown question' " + onoffspec.pivotname + "'.  -none ignored" );
                    continue;
                }
                //*** We do not validate the LHS; we could be testing a hidden field or an Other field. validate lhs? validate rhs?
                //	lhs format: value,value,value but not range of values; spaces ok too
                var values = lhs.split ( /[, ]/);           //"," works
                for ( var j = 0 ; j < values.length ; j++ ) {
                    if ( values[j].length < 1 )
                        continue;
                    var onoffcondition = new ShowAndHide_Condition ();
                    onoffcondition.value = values [j];	//	value of the pivot element
                    onoffcondition.affects = rhs;		//	expression with the elements that are affected when triggered
                    if ( onoffspec != null ) {
                        onoffspec.conditions [ onoffcondition.value ] = onoffcondition;
                    }
                }
            }
        }
    }

    if ( onoffspec != null && onoffspec.conditions != null ) {
        ShowAndHide_AddSpec (theform, onoffspec ) ; //  will alert and ignore the spec it is a duplicate
    }
}

//  Executed at the bottom of the page by an explicit invocation at the bottom of Standard_  form style
//  Other styles must do this as well
function ShowAndHide_CheckQuestionsExist (  ) {

    for ( var x in ShowAndHide_Specs ) {
        var onoffspec = ShowAndHide_Specs[x];
        var theform = onoffspec.theform;
        if ( ! theform  || ! onoffspec.pivotname )
            return false;
        //  test that the conditional question exists
        var cqname = onoffspec.pivotname ;
        if (!  theform [ cqname ] ) {
            //  This should have been caught in declaration
            alert ( "DisplayOrHide - conditional question ' + qname + ' does not exist " );
        }
        var conditions = onoffspec.conditions;
        for ( var condition  in conditions ) {
            var onoffcondition = conditions [condition ];
            var qnames = ShowAndHide_ParseIntoQuestionsList (theform, onoffspec, onoffcondition, true);
            if ( ! qnames || qnames.length < 1 )
                continue;
            for ( var k = 0 ; k < qnames.length; k++ ) {
                var qname = qnames [k];
                var id = ShowAndHide_StandardFieldName  ( theform, qname);
                var elmt = document.getElementById(id) ;
                if ( elmt == null ) {
                    alert ('DisplayOrHide - affected question ' + qname + ' does not exist '  );
                    return true;
                }
            }
        }
        ShowAndHide_InitialDisplay ( theform, onoffspec ) ;
    }
    return false;
}

function ShowAndHide_InitialDisplay ( theform, onoffspec ) {
    if ( ! theform || ! onoffspec )
        return;
    window.vwfEventsExclude = 99;  //  avoid triggering Cascading events
//if ( debugging () ) console.log ("ShowAndHide_InitialDisplay: ", onoffspec);
    //switch ( onoffspec.pivottype ) {
    var onoffpivottype = vwfistypeText (onoffspec.pivottype) ? 'text' : onoffspec.pivottype ;   //  reduce HTML5 types down to 'text'
    switch ( onoffpivottype ) {
        case 'select-one':
            var thedropdown = theform.elements [ onoffspec.pivotname ];
            eval ( thedropdown.onchange() );
            break;
        case 'radio':
        //  Begin by determining which of the radio buttons, if any is checked
        //  If one is checked, run onoff with that element, or perhaps even better, if possible, eval its onclick !
        //  If none of them are checked, perform the -none action, with a default of all visible
            var checkedvalue = null;
            var theradiobuttons = theform.elements [ onoffspec.pivotname ];
        //  includes the normal radio buttons + the other button + the other field
            for ( var ir = 0 ; ir < theradiobuttons.length; ir++ ) {
                var theradiob = theradiobuttons [ir];
                ////                alert ( 'Init' + theradiob.id);////
                if ( theradiob.type == 'radio' && theradiob.checked ) {
                    checkedvalue = theradiob.value;
                    eval ( theradiob.onclick() );   //  onclick handler is ShowAndHide_ChangeHandler (this)
                }
            }
            if ( ! checkedvalue ) { //  nothing checked
                var nonespec = condition = onoffspec.conditions ['-none'] ;
                var allconditions = onoffspec.conditions;
                //noinspection ConstantIfStatementJS
                if ( ! nonespec ) {  //***  code here for a -none spec    OOPS bug if hard coded
                    //  no -none spec
                    //  go through all conditions  and apply nonehide|noneshow
                    var attrib = ShowAndHide_getDisplayAttribute (onoffspec.noneaction.charAt (0) != 'h');
                    for ( var allconds in allconditions ) {
                        var thiscond = allconditions [ allconds ];
                        ShowAndHide_ChangeQuestionsAffected (theform, thiscond, attrib, onoffspec);
                    }
                }
                else {
                    //  Make everything invisible
                    for ( var allcondsv in allconditions ) {
                        var thiscondv = allconditions [ allcondsv ];
                        ShowAndHide_ChangeQuestionsAffected (theform, thiscondv, 'none', onoffspec);
                    }
                    ShowAndHide_ChangeQuestionsAffected (theform, nonespec, '', onoffspec);
                }
            }
            break;
        case 'checkbox':
        //  For each of the checkbox values (special case if only one!),
        //  If there is an entry in the spec, check the button and turn the affected values on / off accordingly
            var ncheckboxes = onoffspec.pivotlength ;
            var thecheckbuttons = theform.elements [ onoffspec.pivotname ];
            if ( ncheckboxes == 1 ) {
                //noinspection UnnecessaryLocalVariableJS
                var thecheckbut = thecheckbuttons;
                var value = thecheckbut.value;
                var condition = onoffspec.conditions [ value ];
                if ( condition && value == condition.value ) {
                    //  The condition applies; interrogate the checkbox
                    var checked = thecheckbut.checked;
                    var attrib = ShowAndHide_getDisplayAttribute(checked );
                    ShowAndHide_ChangeQuestionsAffected ( theform, condition, attrib, onoffspec );
                }
            }
            else {
                for ( var ir = 0 ; ir < thecheckbuttons .length; ir++ ) {
                    var thecheckbut = thecheckbuttons  [ir];
                    var value = thecheckbut.value;
                    var condition = onoffspec.conditions [ value ];
                    var isother = false;
                    if ( '' == value ) {
                        condition = onoffspec.conditions ['-other'];
                        if ( condition != null )
                            isother = true;
                    }
                    if ( isother || ( condition && value == condition.value ) )  {
                        //  The condition applies; interrogate the checkbox
                        var checked = thecheckbut.checked;
                        var attrib = ShowAndHide_getDisplayAttribute(checked );
                        ShowAndHide_ChangeQuestionsAffected ( theform, condition, attrib, onoffspec );
                    }
                }
            }
            break;
        case 'hidden':
        case 'text':
            var thetext = theform.elements [ onoffspec.pivotname ];
            eval ( thetext.onchange() );
            break;
        default:

    }
    window.vwfEventsExclude = null;
}

function ShowAndHide_Setup_Handlers ( theform, onoffspec ) {
    //if ( debugging () ) console.log ("ShowAndHide_Setup_Handlers: ", onoffspec);
    //noinspection FallthroughInSwitchStatementJS
//    switch ( onoffspec.pivottype ) {
    var theformname = theform.getAttribute ('name')
    var onoffpivottype = vwfistypeText (onoffspec.pivottype) ? 'text' : onoffspec.pivottype ;   //  reduce HTML5 types down to 'text'
    switch ( onoffpivottype ) {
        case 'select-one':
            var thedropdown = theform.elements [ onoffspec.pivotname ];
            window.vwfEventsListObject.addEvent ( 1, ShowAndHide_EventName ( theformname ,onoffspec.pivotname),
                    ShowAndHide_ChangeHandler );
                thedropdown.onchange = vwfGetUpdatedHandler ( thedropdown, thedropdown.onchange );
                if ( ShowAndHide_IsFirefox () ) {
                    thedropdown.onkeyup = vwfGetUpdatedHandler ( thedropdown, thedropdown.onkeyup );
                }
            break;
        case 'checkbox':
        case 'radio':
            var theradiobuttons = theform.elements [ onoffspec.pivotname ];
            //  Only one of these for the entire set of radio buttons, not one per button!
            window.vwfEventsListObject.addEvent ( 1, ShowAndHide_EventName ( theformname ,onoffspec.pivotname),
                    ShowAndHide_ChangeHandler );
            if ( theradiobuttons.length == null  ) {
                //  a single checkbox or single radio
                theradiobuttons.onclick = vwfGetUpdatedHandler ( theradiobuttons, theradiobuttons.onclick );
            }
            else {
                for ( var ir = 0 ; ir < theradiobuttons.length; ir++ ) {
                    var theradiob = theradiobuttons [ir];
                    if (theradiob.type == 'checkbox' ||  theradiob.type == 'radio' ) {
                        theradiob.onclick = vwfGetUpdatedHandler ( theradiob, theradiob.onclick );
                    }
/* Not really needed -- it's a nop anyway
                    else if ( theradiob.type == 'text' ) {
                        //  Text field for Other; do not add or change handler
                    }
*/
                }
            }
            break;
        case 'hidden':; // fall through
        case 'text':;
            var thetextfield = theform.elements [ onoffspec.pivotname ];
            window.vwfEventsListObject.addEvent ( 1, ShowAndHide_EventName ( theformname ,onoffspec.pivotname),
                    ShowAndHide_ChangeHandler );
            thetextfield.onchange = vwfGetUpdatedHandler ( thetextfield, thetextfield.onchange );
            break;
        default:

    }
}

function ShowAndHide_AddSpec ( theform, onoffspec ) {
    //  Initialize on off visibility on load
    if ( ! onoffspec )
        return true;    //  malfunction
    if ( ShowAndHide_Specs [ onoffspec.pivotname ] != null ) {
        alert ( 'DisplayOrHide - question ' + onoffspec.thespecquestion + ' is trying to redefine conditions for question ' +
                onoffspec.pivotname+ ', which were already defined in question ' + ShowAndHide_Specs [ onoffspec.pivotname ].thespecquestion + '.  Redefinition ignored. ' );
        return true;
    }
    ShowAndHide_Specs [ onoffspec.pivotname ] = onoffspec;

    //  Setup up the element handlers
    ShowAndHide_Setup_Handlers ( theform, onoffspec );
    return false;
}

/* *****************************  onchange / onclick handler ********************* */

function ShowAndHide_ChangeHandler (elmt) {

    //	find the element where it should be found
    var theform = elmt.form;
    var onoffspec = ShowAndHide_Specs [ elmt.name ];
    if ( ! onoffspec  ) {
        // alert ( 'no onoffarray ' + elmt.name );
        return false;
    }
    var theconditions = onoffspec.conditions;
    if ( ! theconditions )
        return false;

    if ( debugging () ) console.info ("ShowAndHide_ChangeHandler:", elmt);

    initializetracking ( onoffspec );

    var condition = null;
//    switch ( onoffspec.pivottype ) {
    var onoffpivottype = vwfistypeText (onoffspec.pivottype) ? 'text' : onoffspec.pivottype ;   //  reduce HTML5 types down to 'text'
    switch ( onoffpivottype ) {
        case 'radio':
        {
            var radioid = elmt.id;
            var litnone = '-none';
            var litother = '-other';
            var litnoneix = radioid.indexOf (litnone) ;
            var litotherix = radioid.indexOf (litother) ;
            var isradionone = litnoneix >= 0 && radioid.indexOf (litnone) == radioid.length - litnone.length;
            var isradioother = litotherix >= 0 && radioid.indexOf (litother) == radioid.length - litother.length;
            var emptyvalue = '' == elmt.value;

            if ( isradionone )
                condition = theconditions ['-none'] ;
            else if ( ! emptyvalue )
                condition = theconditions [elmt.value];
            /*
                        if ( ''==elmt.value )
                            condition = theconditions ['-none'] ;
                        else
                            condition = theconditions [elmt.value];
            */
            if ( ! condition ) {
                //  No condition matches the value. Perform otheraction, depending on othershow or otherhide:
                for ( var allconds2 in theconditions ) {
                    var thiscond2 = theconditions [ allconds2 ];
                    var attrib2 = ShowAndHide_getDisplayAttribute (onoffspec.otheraction.charAt (0) != 'h');
                    ShowAndHide_ChangeQuestionsAffected ( theform, thiscond2, attrib2, onoffspec );
                }
                //  Now look for -other or -others specification
                condition = theconditions ['-other'] ;
                if ( ! condition )
                    condition = theconditions ['-others'] ;
                if ( ! condition ) {
                    //  No -other specification; done
                    closetracking (onoffspec );
                    return true;
                }
                //  Display the affected questions if the button is the other button, hide them other wise
                var isother2 = elmt.value == '';
                var showorhide2 = ShowAndHide_getDisplayAttribute(isother2);
                ShowAndHide_ChangeQuestionsAffected ( theform, condition, showorhide2, onoffspec );
                closetracking (onoffspec );
                return true;
            }
            //
            for ( var allconds3 in theconditions ) {
                var thiscond3 = theconditions [ allconds3 ];    //  Hide the non-affected questions first
                if ( condition.value != thiscond3.value && condition.affects != thiscond3.affects ) {
                    ShowAndHide_ChangeQuestionsAffected ( theform, thiscond3, "none",onoffspec );
                }
            }
            ShowAndHide_ChangeQuestionsAffected ( theform, condition, "", onoffspec ); //  Display the affected questions last

        }
            break;
        case 'checkbox':
        //  if there is a condition associate with the value being checked
        //  if the value is checked, set the region visible, otherwise invisible
        //  If there is no condition associated with the value, nop
            condition = theconditions [elmt.value];
            if ( ! condition ) {
                if (  '' != elmt.value )
                    return true;
                //  This is the 'other' checkbox, with an empty value
                //  Now look for -other or -others specification
                condition = theconditions ['-other'] ;
                if ( ! condition )
                    condition = theconditions ['-others'] ;
                if ( ! condition ) {
                    //  No -other specification; done
                    return true;
                }
                //  fall through using -other condition
            }
            var checked = elmt.checked ;
            var attrib = checked ? "" : "none";
            ShowAndHide_ChangeQuestionsAffected ( theform,  condition , attrib, onoffspec );
        // Note that these guys can include an Other box that will be retrieved in the group!
            break;
        case 'select-one':
        //  Begin by determining the selection Not needed here, actually this belongs elsewhere
            var thedropdown = theform.elements [ onoffspec.pivotname ];
            var valueselected = '';
            if (  thedropdown )  {
                var ix = thedropdown.selectedIndex ;
                if (  ix  &&  ix >= 0 ) {
                    var optionselected = thedropdown.options [ ix ] ;
                    if ( optionselected ) {
                        if ( optionselected.value )
                            valueselected = optionselected.value ;
                    }
                }
            }
            condition = valueselected != ''  ? theconditions [valueselected] : theconditions ['-none'];
            if ( condition ) {
                for ( var allconds9 in theconditions ) {
                    //  Hide the non-affected questions
                    var thiscond9 = theconditions [ allconds9 ];
                    if ( condition.value != thiscond9.value && condition.affects != thiscond9.affects ) {
                        ShowAndHide_ChangeQuestionsAffected ( theform, thiscond9, "none", onoffspec );
                    }
                }
                //  Display the affected questions last
                ShowAndHide_ChangeQuestionsAffected ( theform, condition, "", onoffspec );
            }
            else {  //  No condition applies, this is -other
                // alert ( "no condition, other applies" );
                //  No condition matches the value. Perform otheraction, depending on othershow or otherhide:
                for ( var allconds7 in theconditions ) {
                    var thiscond7 = theconditions [ allconds7 ];
                    var attrib7 = ShowAndHide_getDisplayAttribute (onoffspec.otheraction.charAt (0) != 'h');
                    ShowAndHide_ChangeQuestionsAffected ( theform, thiscond7, attrib7, onoffspec );
                }
                //  Now look for -other or -others specification
                condition = theconditions ['-other'] ;
                if ( ! condition )
                    condition = theconditions ['-others'] ;
                if ( ! condition ) {
                    //  No -other specification; done
                    break;
                }
                //  Display the affected questions
                ShowAndHide_ChangeQuestionsAffected ( theform, condition, "", onoffspec );
            }
            break;
        case 'hidden':
        case 'text':
        {
            condition = null;
            var emptytextvalue = elmt.value == null || '' == elmt.value ;
            if ( emptytextvalue )
                condition = theconditions ['-none'] ;
            else
                condition = theconditions [elmt.value];

            if ( ! condition ) {
                //  No condition matches the value. Perform otheraction, depending on othershow or otherhide:
                for ( var allconds in theconditions ) {
                    var thiscond = theconditions [ allconds ];
                    var attrib = ShowAndHide_getDisplayAttribute (onoffspec.otheraction.charAt (0) != 'h');
                    ShowAndHide_ChangeQuestionsAffected ( theform, thiscond, attrib, onoffspec );
                }
            //  Now look for -other or -others specification
                condition = theconditions ['-other'] ;
                if ( ! condition )
                    condition = theconditions ['-others'] ;
                if ( ! condition ) {
                    //  No -other specification; done
                    closetracking (onoffspec );
                    return true;
                }

                //  Display the affected questions if the button is the other button, hide them other wise
                var isother = elmt.value == '';
                var showorhide = ShowAndHide_getDisplayAttribute(isother);
                ShowAndHide_ChangeQuestionsAffected ( theform, condition, showorhide, onoffspec );
                closetracking (onoffspec );
                return true;
            }
            for ( var allconds in theconditions ) {
                //  Hide the non-affected questions first
                var thiscond = theconditions [ allconds ];
                if ( condition.value != thiscond.value && condition.affects != thiscond.affects ) {
                    ShowAndHide_ChangeQuestionsAffected ( theform, thiscond, "none", onoffspec );
                }
            }
    //  Display the affected questions last
            ShowAndHide_ChangeQuestionsAffected ( theform, condition, "", onoffspec );
        }
            break;
        default:
    }
    closetracking (onoffspec );
    return true;
}

function ShowAndHide_ChangeQuestionsAffected ( form, condition, status, onoffspec ) {

    //if ( debugging () ) console.log ("ShowAndHide_ChangeQuestionsAffected", condition.value,status, onoffspec);

    //   Parse affects into multiple question name specifications, eg q1,q2,q3
    var qnames = ShowAndHide_ParseIntoQuestionsList (form, null, condition, false);
    for ( var k = 0; k < qnames.length; k++ ) {
        var qname = qnames [k];
        if ( ! onoffspec.hidemethod || 'h'== onoffspec.hidemethod ) {
            ShowAndHide_ChangeVisibility ( form, qname, status, onoffspec );
            ShowAndHide_ResetElement ( form, qname, status, onoffspec  );
        }
        if ( onoffspec.hidemethod && 'd' == onoffspec.hidemethod ) {
            //  Disable the controls within instead of hiding the element
            var qgroup = form.elements [qname];
            if ( ! qgroup )
                continue;
            var qspec = new ShowAndHide_QuestionSpec ( qgroup, qname );
            ShowAndHide_SetControlEnabled ( qspec, qgroup, status != 'none' );
            ShowAndHide_ChangeDisability ( form, qname, status, onoffspec )
            ShowAndHide_ResetElement ( form, qname, status, onoffspec  );
        }
    }
}

function ShowAndHide_ParseIntoQuestionsList ( form, onoffspec, condition, alerting ) {
    var questionlist = new Array();
    if ( condition.affects.length < 1 ) {
        return questionlist;
    }
    var qnames = condition.affects.split ( ",") ;   // can't split with blank or commas because q1 - q2 !
    for ( var k = 0; k < qnames.length; k++ ) {
        var qnamerange = qnames [k];
        qnamerange = ShowAndHide_Trim (qnamerange);
        if ( qnamerange.length < 1 )
            continue;
        //   see if it is a range q1-q2
        var range = qnamerange.split ('-');
        switch ( range.length ) {
            case 1:
                questionlist [ questionlist.length ] = ShowAndHide_Trim (  range [0] );
                break;
            case 2:
                var isok = ShowAndHide_getAllQuestionNamesInRange ( questionlist, form, ShowAndHide_Trim ( range [0]), ShowAndHide_Trim ( range [1] ) ) ;
                if ( isok != '' && alerting )
                    alert (isok);
                break;
            default:
                if ( alerting )
                    alert ( "ShowAndHide: The range of affected questions for question " + onoffspec.pivotname + " mustbe of the form q1-q2" );
        }
    }
    return questionlist;
}

//  Return all qnames that one can identify between qname1 and qname2
//  We're searching for elements of the form vwfpollid!
function ShowAndHide_getAllQuestionNamesInRange ( questionlist, form, q1, q2 ) {
    var returning = '';
    var allelements = form.getElementsByTagName('*');
    var n = 0;
    var prefix = ShowAndHide_StandardFieldName(form,'');
    var afterprefix = prefix.length;
    var q1id = ShowAndHide_StandardFieldName(form,q1);
    var q2id = ShowAndHide_StandardFieldName(form,q2);

    var foundq1 = false;
    var foundq2 = false;
    for ( var k = 0 ; k < allelements.length; k++ ) {   //  allelements.length
        var elmt = allelements [k] ;
        var elmtid = elmt.id;
        if ( !elmtid )
            continue;
        if ( ! vwfShowAndHide_StartsWith ( elmtid,  prefix ) )
            continue
        if ( q1id == elmtid ) {
            foundq1 = true;
        }
        if ( foundq1 ) {
            n++;
            questionlist [ questionlist.length ] = elmtid.substring ( afterprefix );
        }
        if ( q2id == elmtid ) {
            foundq2 = true;
            break;
        }
    }
    if ( ! foundq1 )
        returning += " DisplayOrHide - cannot find question " + q1 ;
    if ( ! foundq2 )
        returning += " DisplayOrHide - cannot find question " + q2 ;
    return returning;
}

/*
    The actionable element for q1: the fieldset (for an element) , the div for an html question, the table for a grid,
    has an ID of the form: vwf pollid qname
+     Action/comment: not expressed (could change in different styles; if expressed, should be same as HTML)
+     Hidden: div without an ID (bug, may be present in legacy surveys!). Should be same as HTML
+     textarea, text, radio, all elements:  fieldset vwf pollid qname

Exception is a bug for hidden (easy enough to fix, but be careful) (and it wouldn't matter much, since the div for a hidden question is invisible anyway !

How do we use it with a matrix?


So ShowAndHide_ChangeVisibility is what triggers trackvisibility which iswhat recurs


*/


function ShowAndHide_ChangeDisability ( form, qname, status, onoffspec ) {

    //	The element being shown or hidden must have an id of the form form.id + qname
    var fieldsetname = ShowAndHide_StandardFieldName(form,qname);     //  eg vwfAcc2qhide' + qname
    var fieldset = document.getElementById (fieldsetname) ;
    if ( fieldset != null ) {
        var disabattribute = 'data-disability'
        var att = fieldset.getAttribute(disabattribute)
        if ( !att )
            att = ''
        var origvisibility = att // 'none' or ''
        // Make changes to fieldset
        var disableclass = 'cogix-disable';
        fieldset.setAttribute (disabattribute, status)
        if ( status !== 'none' )
            fieldset.classList.remove(disableclass)
        else
            fieldset.classList.add(disableclass)
        ShowAndHide_TrackVisibility ( qname, origvisibility, status, onoffspec );

        // if ( true) console.log ( "ShowAndHide_ChangeDisability ", qname, origvisibility, status ,fieldset);
    }
}


function ShowAndHide_ChangeVisibility ( form, qname, status, onoffspec ) {

    //	The element being shown or hidden must have an id of the form form.id + qname
    var fieldsetname = ShowAndHide_StandardFieldName(form,qname);     //  eg vwfAcc2qhide' + qname
    var elementbeingset = document.getElementById (fieldsetname) ;
    if ( elementbeingset != null ) {
        var origvisibility = elementbeingset .style.display ;
        elementbeingset .style.display = status;
        ShowAndHide_TrackVisibility ( qname, origvisibility, status, onoffspec );
        if ( debugging () ) console.log ( "ShowAndHide_ChangeVisibility ", qname, origvisibility, status ,elementbeingset);

    }
}

function ShowAndHide_StandardFieldName ( form, qname ) {
    var formid = form.id;   //  starts with "form", eg formAcc2qhide
    var spotpollid = formid.substring (4);  //  remove 'form'
    var fieldsetprefix = "vwf";
    return fieldsetprefix + spotpollid + qname; //  eg vwfAcc2qhide
}

function ShowAndHide_TrackVisibility (qname, origvisib, newvisib , onoffspec) {
    if ( ! onoffspec || ! onoffspec.visibilitytracker )
        return;
    if (  typeof ( onoffspec.visibilitytracker [ qname ] ) == 'undefined' ) {
        //  not yet initialized, save original visibility state as 0 or 1
        onoffspec.visibilitytracker [ qname ] = 'none' == origvisib ? '0' : '1';
    }
    //  append current visibility state as 0 or 1
    onoffspec.visibilitytracker [ qname ] +=  'none' == newvisib ? '0' : '1';  ;

    //  When we are done, will contain:
    // 1.....1  when visible was set to visible
    // 0....0  when invisible was set to invisible
    // 1.....0  when changed from visible to invisible
    // 0....1when changed from invisible to visible
}

//  Remove and Restore values of elements being hidden and  displayed
function ShowAndHide_ResetElement ( form, qname, status,onoffspec) {
    //    if ( debugging () ) console.log ("ShowAndHide_ResetElement: ", qname, status);
    var qgroup = form.elements [qname];
    if ( ! qgroup )
        return;
    var qspec = new ShowAndHide_QuestionSpec ( qgroup, qname );
    if ( ! qspec.pivottype )
        return;
    var bhiding = status == "none";
    var resetmethod = onoffspec ? onoffspec.resetmethod.charAt(0) : 'r';
    //  Post action in ShowAndHide_HiddenQuestions
    if ( debugging () )console.warn ( "ShowAndHide_HiddenQuestions" , qname, bhiding );
    if ( ShowAndHide_HiddenQuestions )
        ShowAndHide_HiddenQuestions [ qname ] = bhiding ? "1" : "0";
// debugger;
    if ( bhiding ) {
        switch ( resetmethod ) {
            case 'd':   //  disable control
                ShowAndHide_SetControlEnabled ( qspec, qgroup, false );
                break;
            case 'p':   //  preserve, leave values alone
                break;
            case 'r':   //  default, remove values
            default:
                if ( ShowAndHide_AvoidReset ( form.getAttribute('name') ) )
                //if ( ShowAndHide_AvoidReset ( form.name ) ) fails with 'name' question
                    return; // ideally should be return!
                var savevalues = false;
                if ( onoffspec && onoffspec.hiddenquestions ) {
                    if (  '1' == onoffspec.hiddenquestions [qname]  )
                        savevalues = true;
                    onoffspec.hiddenquestions [qname] = '1';   //  mark as having been reset
                }
            // Will remove all values from control, and save them if not already saved
            // savevalues may be unnecessary, since we only save once anyway
                ShowAndHide_RemoveValuesFromControl ( qspec, qgroup );
                break;
        }
    }
    else{ // showing
        switch (resetmethod ) {
            case 'd':   //  disable control
                ShowAndHide_SetControlEnabled ( qspec, qgroup, true);
                break;
            case 'p':   //  preserve, leave values alone
                break;
            case 'r':   //  default, remove values
            default:
                if ( onoffspec.hiddenquestions ) {
                    if (  '1' == onoffspec.hiddenquestions [qname]  ) {
                        ShowAndHide_RestoreControl (qspec, qgroup);
                    }
                }
        }
    }
    //????? Maybe here is where we have to trigger change handlers for affected element?
}

function ShowAndHide_AvoidReset ( formname ) {
    var elmt = document.getElementById ( 'vwfDisplayOrHideAvoidReset' + formname);
    return elmt != null;
}


//  Disable / enable control and style question text
function ShowAndHide_SetControlEnabled (qspec,qgroup, bEnable) {
    switch ( qspec.pivottype ) {
        case 'radio':
        case 'checkbox':
            for ( var ir = 0 ; ir < qgroup.length; ir++ ) {
                var thebutton = qgroup [ir];
                thebutton.disabled = ! bEnable ;
            }
            break;
        default:
            qgroup.disabled = ! bEnable ;
    }
}

function DisableChangeText (qspec,qgroup,bEnable) {
    var elmt = qgroup
    switch ( qspec.pivottype ) {
        case 'radio':
        case 'checkbox':
            elmt = qgroup [0]
            break;
        default:
    }
    var fs = Cogix_Closest_Parent (elmt,'fieldset')
    if (fs) {
        var disableclass = 'cogix-disable';
        if ( bEnable )
            fs.classList.remove(disableclass)
        else
            fs.classList.add(disableclass)
    }
}

// Remove value from control
function ShowAndHide_RemoveValuesFromControl (qspec,qgroup) {
//    switch ( qspec.pivottype ) {
    var onoffpivottype = vwfistypeText (qspec.pivottype) ? 'text' : qspec.pivottype ;   //  reduce HTML5 types down to 'text'
    switch ( onoffpivottype ) {
        case 'radio':
        case 'checkbox':
            for ( var ir = 0 ; ir < qgroup.length; ir++ ) {
                var thebutton = qgroup [ir];
                if ( vwfistypeText (thebutton.type) ) { //  thebutton.type == 'text' ) {
                    if ( thebutton.previousvalue == null )
                        thebutton.previousvalue = qgroup.value;
                    thebutton.value = '';   //  This is the Other field
                }
                else {
                    if ( thebutton.cogixpreviouscheck == null )
                        thebutton.cogixpreviouscheck = thebutton.checked;
                    thebutton.checked = false;
                }
            }
            break;
        case 'select-one':
            if ( qgroup.cogixpreviousindex == null )
                qgroup.cogixpreviousindex = qgroup.selectedIndex;
            qgroup.selectedIndex = 0;
            break;
        case 'text':
        case 'textarea':
            if ( qgroup.previousvalue == null )
                qgroup.previousvalue = qgroup.value;
            qgroup.value = '';
        /*
                    var checkhandler = qgroup.onchange;
                    if ( checkhandler && (""+checkhandler).indexOf ("Calcvwf_Recalculate") > 0 && Calcvwf_Recalculate ) {
                        Calcvwf_Recalculate ( qname, CalculatorArray_vwf, form );
                    }
        */
            break;
    }
}

function ShowAndHide_CascadeHiding ( parentonoffspec, onoffspec ) {
    var theconditions = onoffspec.conditions;
    if ( ! theconditions )
        return false;
    //  Hide all the questions
    initializetracking ( onoffspec );
    for ( var cond in theconditions ) {
        var thiscondtion  = theconditions [ cond ];
        var attribute = 'none';
        ShowAndHide_ChangeQuestionsAffected ( onoffspec.theform, thiscondtion, attribute, onoffspec );
    }
    closetracking (onoffspec);
}

function ShowAndHide_TriggerHandler (visibqname, visibrecord, parentonoffspec ) {
    //  Is the question a DOH question itself ?
    var targetonoffspec = ShowAndHide_Specs [ visibqname ] ;
    if ( targetonoffspec  != null ) {
        if ( debugging () )console.warn ( "ShowAndHide_TriggerHandler" , visibqname, visibrecord );
        var hiding = visibrecord.charAt(visibrecord.length-1) == '0';
        if ( hiding ) {
            ShowAndHide_CascadeHiding ( parentonoffspec, targetonoffspec );
        }
        else {
            ShowAndHide_InitialDisplay ( targetonoffspec.theform, targetonoffspec );
        }
    }
    else {
        //  execute any onchange handlers (ok for dropdowns, hidden and text, NG for radio!
        // Note that this will not work if the question is radio ( no onchange handler!)
        var form = parentonoffspec.theform;
        if ( ! form )
            return;
        var elmt = form [ visibqname ];
        if ( ! elmt )
            return;
        if ( elmt.onchange ) {
            eval ( elmt.onchange()  );  //  onchange(elmt) 709 correction for IE -- can't attempt to pass an argument, and we don't need to -- outright coding error
        }
    }
}

function initializetracking ( onoffspec ) {
    onoffspec.visibilitytracker = new Object ();
    onoffspec.hiddenquestions = new Object ();
}


function closetracking  ( onoffspec ) {
    // For all those questions that were hidden, who might have stored values, remove them
    for (var hiddenqname in onoffspec.hiddenquestions ) {
        if ( onoffspec.hiddenquestions.hasOwnProperty(hiddenqname)) {
            ShowAndHide_RemoveSavedValues ( onoffspec.theform, hiddenqname );
        }
    }
    // For all those questions where visibility changed, cascade show and hide when using hidechildren
    for (var visibqname in onoffspec.visibilitytracker ) {
        if (onoffspec.visibilitytracker.hasOwnProperty(visibqname)) {
            // trigger whatever it was that we found by calling ShowAndHide_TriggerHandler here
            var visibrecord = onoffspec.visibilitytracker [ visibqname ];
            if ( visibrecord && visibrecord.length >= 2 && visibrecord.charAt(0) != visibrecord.charAt(visibrecord.length-1) ) {
                if ( onoffspec.hidechildren ) {
                    // Invoke the change handler(s) here ; not clear exactly how.
                    //    if ( debugging () )console.log( "trigger handler for" , visibqname, visibrecord );
                    ShowAndHide_TriggerHandler (visibqname, visibrecord, onoffspec );
                }
            }
        }
    }
    onoffspec.hiddenquestions = new Object();
//    window.status = "closetracking " + ( ++xxxx );
}


function ShowAndHide_RemoveSavedValues  ( form, qname) {
    //    if ( debugging () ) console.log ("ShowAndHide_RemoveSavedValues: ", qname);
    var qgroup = form.elements [qname];
    if ( ! qgroup )
        return;
    var qspec = new ShowAndHide_QuestionSpec ( qgroup, qname );
    if ( ! qspec.pivottype )
        return;
    ShowAndHide_RemoveSavedValuesFromControl ( qspec, qgroup);
}

// Remove saved values from control
function ShowAndHide_RemoveSavedValuesFromControl (qspec,qgroup) {
    //    if ( debugging () ) console.log ("ShowAndHide_RemoveSavedValuesFromControl: ", qgroup);
//    switch ( qspec.pivottype ) {
    var onoffpivottype = vwfistypeText (qspec.pivottype) ? 'text' : qspec.pivottype ;   //  reduce HTML5 types down to 'text'
    switch ( onoffpivottype ) {
        case 'radio':
        case 'checkbox':
            for ( var ir = 0 ; ir < qgroup.length; ir++ ) {
                var thebutton = qgroup [ir];
                if ( vwfistypeText (thebutton.type) ) { //   thebutton.type == 'text' ) {
                    if ( thebutton.previousvalue != null ) {
                        thebutton.previousvalue = null;
                    }
                }
                else {
                    if ( thebutton.cogixpreviouscheck != null ) {
                        thebutton.cogixpreviouscheck  = null;
                    }
                }
            }
            break;
        case 'select-one':
            if ( qgroup.cogixpreviousindex != null ) {
                qgroup.cogixpreviousindex = null;
            }
            break;
        case 'text':
        case 'textarea':
            if ( qgroup.previousvalue != null ) {
                qgroup.previousvalue = null;
            }
            break;
        default:
    }

}

function ShowAndHide_RestoreControl (qspec,qgroup) {
//    switch ( qspec.pivottype ) {
    var onoffpivottype = vwfistypeText (qspec.pivottype) ? 'text' : qspec.pivottype ;   //  reduce HTML5 types down to 'text'
    switch ( onoffpivottype ) {
        case 'radio':
        case 'checkbox':
            for ( var ir = 0 ; ir < qgroup.length; ir++ ) {
                var thebutton = qgroup [ir];
                if ( vwfistypeText (thebutton.type) ) { //   thebutton.type == 'text' ) {
                    if ( thebutton.previousvalue != null ) {
                        thebutton.value = thebutton.previousvalue;   //  This is the Other field
                        thebutton.previousvalue = null;
                    }
                }
                else {
                    if ( thebutton.cogixpreviouscheck != null ) {
                        thebutton.checked = thebutton.cogixpreviouscheck ;
                        thebutton.cogixpreviouscheck  = null;
                    }
                }
            }
            break;
        case 'select-one':
            if ( qgroup.cogixpreviousindex != null ) {
                qgroup.selectedIndex = qgroup.cogixpreviousindex;
                qgroup.cogixpreviousindex = null;
            }
            break;
        case 'text':
        case 'textarea':
            if ( qgroup.previousvalue != null ) {
                qgroup.value = qgroup.previousvalue;
                qgroup.previousvalue = null;
            }
            break;
        default:
    }
}

function ShowAndHide_getDisplayAttribute (v) {
    return v ? "" : "none";
}

function ShowAndHide_Trim ( s ) {
    if ( ! s )
        return '';
    var ibegin = -1;
    var iend = -1;
    for (var i = 0; i < s.length; i ++) {
        if ( !  ShowAndHide_IsTrimmable(s.charAt(i) ) ) {
            ibegin = i;
            break;
        }
    }
    if ( ibegin == -1 )
        return '';  //  empty string
    for ( var j = s.length ; j > ibegin ; j-- ) {
        if ( !  ShowAndHide_IsTrimmable(s.charAt(j-1) ) ) {
            iend = j;
            break;
        }
    }
    return s.substring ( ibegin, iend ) ;
}

function ShowAndHide_IsTrimmable ( c ) {
    return c == ' ' || c == '\r' || c == '\n' ;
}


function ShowAndHide_Dump () {
    for ( var x in ShowAndHide_Specs ) {
        var onoffspec = ShowAndHide_Specs[x];
        var conditions = onoffspec.conditions;
        for ( var y in conditions ) {
            alert ( y );
        }
    }
}

function debugging () {
    if ( ! ShowAndHide_IsFirefox () )
        return false;
    return bdebugging;
}

function ShowAndHide_EventName ( formname, elementname) {
    return formname + '!' + elementname ;
}


    /*  Simulate onChange with dropdown   OK !!!

    OK! Have succeed at emulating creating the event and triggeringit manually with code in this block.
    Next will be actually putting that code in the dropdown handler and seeing if it works!

    window.vwfEventsListObject.addEvent ( 1, "formnewdohcalcezdoh!drop", ShowAndHide_ChangeHandler );
    var testdropdown = document.getElementById('drop');
    testdropdown.selectedIndex=1;
    vwfEventHandler ( testdropdown);

    First test: using the same element in two calculates. Can we do that?
    Yes, without problems. Calculate seems to be able to handle it just fine.

    Next test: using the first dropdwon as both a Doh and a Calculate. (Adding it to total 3)
    newdohcalc  �  twocalsoffonedrop, using old styles, calculates total3 correctly, but only triggered by change in value.
    The change in drop does not trigger calculate in the old one....
    AND IT DOES IN THE NEW ONE !!!

    I think that if i did this:
    doh on a1
    calc a1=b+2
    What would happen?  In the reverse order? Seems legit: the calc triggers a DOH.

    So next:  A calc triggers one or more DOHs by changing the dropdowns.




    I suppose I could build a calculate, using dropdowns as the test type as well, and making it times 2
    BUT would have to use a 2nd dropdown so that we don't run into handler conflicts.

    THEN we would jump right away into handler conflicts

    drop1
    doh on drop1
    drop2
    t1 = calc on drop2*2
    doh on result

    */

    /* For testing
window.vwfEventsListObject.addEvent ( 1, "one", null );
window.vwfEventsListObject.addEvent ( 2, "two", ShowAndHide_ChangeHandler );
window.vwfEventsListObject.dump();
all successful so far



DOH deposits (currently) this:  function () { ShowAndHide_ChangeHandler(this);  eval ( window.ShowAndHide_SavedHandler [this.id] ) ; } ;

In our new future we would create an Event:
window.vwfEventsListObject.addEvent ( 1, formname + '!' + elementname, ShowAndHide_ChangeHandler );
and we also put the form in the element's .form attribute (already doing that)
element.onchange = function () { vwfEventHandler (this); }
DONE AND IT WORKS IN THE SIMPLE CASE, WITH THE DROPDOWN!!!




For Calculate it's working at least in the simple case!

Where do we go from here?
- check that total = value +value works as well - OK
- check if calculate can use the two inputs that are sources for independent DoHs ( ie all 3)
- check if the 3 inputs can be used in multiple calculations

-look for nesting:  use calculated results (total3) as basis for another DOH

The reason why a dropdown doesnt loop is that when create the delayed handler, we don't really do so for
dropdowns, which is what we had been testing.

So next step:
 clobber all existing handlers;
 it's ok to clobber the eventhandler with itself.
 Perhaps next step: if a different handler lives there, copy it to EventHandlers?!!

PENDING: Move all code to proper JS, make sure each one works independently of the other,
Check with unique ranking, Check in portals with 2x of each (ought to fail -- how could we fix this?)
Check with calendar !!!

 Oh, and while I'm at it, implement option to make any controls affected disabled rather than invisible ?!!?!!

Check for all the ++, ??, alert, and 70 droppings

Recheck by changing order of DOH and Calculates, which made a big difference before!

BUG: calculates not triggered when page is loaded. Is that right? ( so it seems!)

So, for example, if we had a DOH that depended on a calculate, and that calculate depended on a hidden field
 that never actually changed, would that DOH ever be triggered?  ( I believe that this might have been the case in
 the CVS examples, with Diagnosis? Not quite; in that case, the trigger happens when the user changes his diagnosis).

BUG: Need to repair Calculate and DOH so that one can express [/question]

Bug? using -hidechildren

And BTW on initial loading, how do we know which events to trigger???

document:
pivotqname:disable   means preserve the values in the hidden controls
pivotqname:hidechildren  means trigger DoH in any nested DoH's
Both???



*/






























