var CogixStandardCopyright = "(c) 2008-2019 Cogix Corporation May only be used as a component of a licensed Cogix product. Decompilation prohibited. Revised March 20, 2019.";
var CogixModuleIdentifier = "XUStandard2_.js";
//  Revised for ViewsFlash 7.03 as the basis for Standard_.js and Standard2_.js 2/14/11
var CogixShortTermQnameForJs=null;  //  Used  to hold the current qname; available with the Javascript Question style only
var CogixShortTermPollid=null;  //  Used to hold the current allalphapollid, which can be used to derive the current formid

if ( typeof window.ShowAndHide_HiddenQuestions  == 'undefined' )
    window.ShowAndHide_HiddenQuestions = new Object ();

function vwfOnSubmit(theform,theformname) {

    // If CogixWhenSubmitted function exists, call it; it will throw if it it displays alert
    if ( Cogix_Is_Function ('CogixWhenSubmitted') ) {
        try {
            CogixWhenSubmitted (theform)
            // see invalid; can set options.founderrors
        } catch (e) {
            // error ignored?
        }
    }

    if (!theform && !theformname) {
        // If coming here from a pre-VF7 style, both theform and theformname are null
        if (typeof window.vwfLastReferencedForm == 'undefined') {
            // Find a form that has an id and has onsubmit handler.
            // The id must be "formXXXX" and onsubmit handler must have onSubmitXXXX, and XXXX must match !!!
            for (var kf = 0; kf < document.forms.length; kf++) {
                var tf = document.forms[kf];
                if (typeof tf.id != undefined && tf && typeof tf.onsubmit != 'undefined' && tf.onsubmit) {
                    var tfid = new String(tf.id);
                    if (tfid.length < 5 || tfid.substring(0, 4) != 'form') continue;
                    var srch = 'onSubmit' + tfid.substring(4);	//	XXXX
                    var onss = new String(tf.onsubmit);
                    if (onss.indexOf(srch) > 0) {
                        window.vwfLastReferencedForm = tf;
                        break;
                    }
                }
            }
        }
        if (typeof window.vwfLastReferencedForm == 'undefined') {
            alert("Unable to find ViewsFlash form");
            return;
        }
        theform = window.vwfLastReferencedForm;
        if (!theform.name)
            theform.name = theform.id;
        theformname = theform.name;
    }
    // Compensate for missing messages in VF6 Standard
    if (typeof i18nArray != 'undefined') {
        if (!i18nArray['presence'])
            i18nArray['presence'] = i18nArray['requiredanswer'];
        if (!i18nArray['checkemailmsg'])
            i18nArray['checkemailmsg'] = 'Invalid email address'; // Better to add appropriate param to form style, for i18n
    }
    var isinline = false;
    var options = null;
    if (theform != null && theformname != null) {
        try {
            options = eval("options$" + theformname);   //  This is defined in the Standard style
        } catch (ignored) {
        }
        if (options != null && 'inline' == options.methodology) {
            //  put an attribute in every element .  element.vwfoptions = theoptions object !!!
            isinline = true;
        }
        ResetValidationMessages(theform, theformname, options);
    }


    //  Populate hidden field with ShowAndHide_HiddenQuestions

    //  Deal with ReadOnly style disableds and read only fields
    if (typeof window.RW_Disabled != 'undefined') {
        for (var em in window.RW_Disabled) { //  re-enable what was disabled
            window.RW_Disabled [em].disabled = false;
        }
    }
    // Or RW_HiddenQuestions into  ShowAndHide_HiddenQuestions
    if (typeof window.ShowAndHide_HiddenQuestions != 'undefined' && typeof window.RW_HiddenQuestions != 'undefined') {
        for (var rwkey in window.RW_HiddenQuestions) {
            if (window.RW_HiddenQuestions [rwkey] && window.RW_HiddenQuestions [rwkey] == 1)
                window.ShowAndHide_HiddenQuestions [rwkey] = true;
        }
    }

    if (theform.vwf_ShowAndHide_HiddenQuestions) {
        var hiddenfield = theform.vwf_ShowAndHide_HiddenQuestions;
        if (hiddenfield) {
            var s = ',';
            for (var k in window.ShowAndHide_HiddenQuestions) {
                if (window.ShowAndHide_HiddenQuestions [k] == "1")
                    s += k + ',';
            }
            hiddenfield.value = s;
        }
    }
    if (options != null)
        options.founderrors = false;
    if (ValidatorArrayProperties == null
        || ValidatorArrayProperties.ValidatorSuppress
        || ValidatorArray == null) { // if broken, don't crash
        return CogixSubmitted(theform,theformname);
    }
    for (k = 0; k < ValidatorArray.length; k++) {
        var validatorstring = ValidatorArray [k];
        if (theformname != null) {
            //  Check to see that the expression includes .forms [ as well as 'theformname'
            var ixofqfq = validatorstring.indexOf("'" + theformname + "'");
            var ixforms = validatorstring.indexOf("forms");
            var ixlbr = validatorstring.indexOf("[");
            if (!( ixforms < ixlbr && ixlbr < ixofqfq ))
                continue;   //  if not forms['theformname'  in the expression, it is not about this form
        }
        var chk = eval(validatorstring);
        if (!chk) {
            return false;
        }
    }

    // If CogixValidate function exists, call it; it will throw if it it displays alert
    if ( Cogix_Is_Function ('CogixValidate') ) {
        try {
            window.CogixValidating = true
            CogixValidate (theform,options)
            window.CogixValidating = false
            // see invalid; can set options.founderrors

        } catch (e) {
            window.CogixValidating = false
            // error found, and not using built in forms, so stop processing
            return false
        }

    }

    if (!isinline) {
        // no errors
        return CogixSubmitted(theform,theformname);
    }
    if ( options && options.founderrors ) {
        if ( options.nlis <= 0 ) {
            //noinspection UnnecessaryLocalVariableJS
            var formid = theformname ;
            var errorboxid = formid.substring (4) + "-form-error";  //  remove form, leaves spotnameplacename
            var errorsummarydiv = document.getElementById (errorboxid);
            errorsummarydiv.innerHTML = ""; // reset the div to nothing if no messages emitted
        }
        //noinspection JSUnusedLocalSymbols
        try {
            scroll ( vwfFindPos (theform)[0], vwfFindPos (theform) [1] );   //  window method;
        } catch(ignored) {}
        return false;
    }
    return CogixSubmitted(theform,theformname);
}

/**
 * @return {boolean}
 */
function CogixSubmitted (form,theformname) {
    try {
        if ( form.CogixSubmitted ) {
            // duplicate submission; should have a timeout to allow resubmission?
            // document.body.style.opacity=.2;
            // alert ("form already submitted, please wwait");
            var formid = theformname ;
            var errorboxid = formid.substring (4) + "-form-error";
            var errorsummarydiv = document.getElementById (errorboxid);
            errorsummarydiv.className="inlineError";
            errorsummarydiv.innerHTML = "Form already submitted. Please wait...";
            return false;
        }
        var buttons = form.querySelectorAll("input[type=submit]");
        for (var k = 0; k < buttons.length; k++) {
            var b = buttons [k];
            if (b.waspressed) {
                if (b.classList) b.classList.add('cogixformsubmitted');
                else b.className += ' cogixformsubmitted';

            }
        }
        form.CogixSubmitted = true;
        document.getElementById ("cogix-progress-footprints").style.display='block';
        return true;
    }
    catch (err) {
        return true;
    }
}

function Cogix_Submit_Setup () {
    var buttons = document.querySelectorAll( "input[type=submit]" );
    for ( var k = 0 ; k < buttons.length; k++ ) {
        var b = buttons [k];
        if (!b.onclick)
            b.onclick = function(){this.waspressed=true;}
    }

}

function ResetValidationMessages ( theform, theformname, options ) {
    if ( theform == null || theformname == null )
        return;
    var statusmsgdiv = document.getElementsByClassName('cogix-msg-alert');
    if ( statusmsgdiv && statusmsgdiv.length > 0 ) {
        for ( var k = 0 ; k < statusmsgdiv.length; k++ )
            statusmsgdiv[k].innerHTML='';
    }
    //noinspection UnnecessaryLocalVariableJS
    var formid = theformname ;
    var errorboxid = formid.substring (4) + "-form-error";  //  remove form, leaves spotnameplacename
    var errorsummarydiv = document.getElementById (errorboxid);
	if ( errorsummarydiv ) {
		errorsummarydiv.className="summaryErrorPlaceholder";
		var correctmsg = i18nArray['correcterrors'];
		if ( correctmsg  != 'correctmsg' ) {
			var thecorrectmsgspan = errorsummarydiv.getElementsByTagName("span");
			if ( thecorrectmsgspan && thecorrectmsgspan .length > 0 )
				thecorrectmsgspan [0].innerHTML= correctmsg;
		}
		// replace everything between ul and /ul with < ! --xx-- >
		var html = errorsummarydiv.innerHTML;
		var i1 = html.indexOf('<UL');
		if ( i1 < 0 )
			i1 = html.indexOf('<ul');
		var i2= html.indexOf('</UL>');
		if ( i2 < 0 )
			i2 = html.indexOf('</ul>');
		if ( i1 > 0 && i2 > 0 ) {
			i1 = html.indexOf ('>',i1 )+1;
			// preserve the ul /ul tags, replace everything in between; ul could have a class= in it.
			html = html.substring (0,i1) + "<!--xx-->" + html.substring ( i2 + 5 );
		}
		else {
			html = "<UL><!--xx--></UL>";
		}
		errorsummarydiv.innerHTML = html;
	}
	if ( options )
	    options.nlis = 0;

    var thespans = theform.getElementsByTagName("SPAN");
    for ( var k = 0 ; k < thespans.length ; k ++ ) {
        var thespan = thespans [k] ;
        var thespanclass = thespan.className;
        if ( 'inlineError' == thespanclass ) {
            thespan.innerHTML = '';
            thespan.className = 'inlineErrorPlaceholder';
        }
    }

    ResetElementClasses ( theform.getElementsByTagName("INPUT") , theformname ) ;   //  there are others like textarea, select I believe
    ResetElementClasses ( theform.getElementsByTagName("SELECT") , theformname  ) ;   //  there are others like textarea, select I believe
    ResetElementClasses ( theform.getElementsByTagName("TEXTAREA") , theformname  ) ;   //  there are others like textarea, select I believe

}

function ResetElementClasses ( theinputelements , formname) {
    for ( var i = 0 ; i < theinputelements.length; i++ ) {
        var item = theinputelements [i];
        item.formname = formname;  //  custom attribute that holds the name of the parent form
        if ( 'elementError' == item.className ) {
            item.className = item.previousclassName ;
            item.previousclassName = null;
        }
    }

}

// Usage : Standard_vwf_AdjustGlobalElements ('[/allalphapollid]' );
function Standard_vwf_AdjustGlobalElements (pollid) {
// Adjustments to provide elements missing in VF6 styles.
	if ( ! pollid )
		return;
	var formid = 'form'+ pollid ;
	var theform = document.forms[formid];
	if ( theform ) {
		if ( ! theform.name )
		   theform.name = theform.id;
	   window.vwfLastReferencedForm = theform;
	}

	var optionsformid = 'options$form' + pollid ;
	if ( ! window [ optionsformid ] ) {
		window [ optionsformid ] = new Object();
		window [ optionsformid ].methodology='alert';
	}
}

function Standard_vwf_AvoidCheck ( grouporelement ) {
    var bhastype = false;
    var qname = null;
    //noinspection JSUnusedLocalSymbols
    try {
        bhastype = grouporelement.type != null;
    } catch ( ignored) {}
    if ( bhastype && grouporelement.type ) { //  if it has a type, either input or select-one dropdown
        qname = grouporelement.name;
    }
    else {  //  either radio or checkbox
        if ( grouporelement.length > 0 )
            qname = grouporelement[0].name;
    }
    if ( ! qname )
        return false;
    if ( ! window.ShowAndHide_HiddenQuestions )
        return false;
    var havestatus = window.ShowAndHide_HiddenQuestions [ qname ];
    if ( ! havestatus )
        return false;
    return "1" == havestatus;
}

function checkQuestionAnswered (group,empty,valuelow,valuehigh,valuetype) {


    if ( group == null || empty == null || valuelow == null || valuehigh == null || valuetype == null )
        return true;
    if ( Standard_vwf_AvoidCheck(group) )
        return true;
    var emptyCheck = empty != " ";

    var bgroup = false;
    if ( group.type == "select-one") {
        if ( ! emptyCheck || group.value != "" )
            return true;
    }
    else if ( group.type == "textarea") {
        if ( ! emptyCheck || group.value != "" )
            return true;
    }
    else if ( group.type == "text" || group.type == "hidden") {
        if ( ! emptyCheck ) {
            if ( group.value == "" ) {
                return true;
            }
            return checkQuestionAnswerInRange ( group, valuelow, valuehigh, valuetype );
        }

        if ( group.value != "" ) {
            return checkQuestionAnswerInRange ( group, valuelow, valuehigh, valuetype );
        }

    }
    else if ( group.type == "oldtext") {
        if ( ! emptyCheck || group.value != "" )
            return true;
    }
    else if ( group.type == "checkbox" ) {
        if ( ! emptyCheck || group.checked )
           return true;
    }
    else if ( group.type == null ) { // radio and multi element checkbox groups
        if ( ! emptyCheck )
            return true;
        bgroup = true;
        for ( var k = 0 ; k < group.length; k ++ )
            if ( group[k].checked )
                return true; // BUG: If radio button is Other, its text element must be non-empty
    }
    else
        return true;
    return postFoundError ( 'presence' , bgroup, group );

}

var vwfMessagesCollected = false;
function getMessage ( msgid, method, thehtmlelement ) {
    if ( ! thehtmlelement )  {
        return ''; // punt if we can't find the element
    }
    var qname = thehtmlelement.name;
    if ( ! vwfMessagesCollected ){
        // Collect additional message overrides from qerror classes (invisible)
        var formname = thehtmlelement.formname;
        if ( ! formname ) {
            return ''; // alert ( 'no formname attribute in element ' + thehtmlelement.name );
        }
        // found form with "formidallalphapollid"
        if ( formname.length < 5 || formname .indexOf('form') != 0 ) {
            // alert (300);
            return '';
        }
        var allalphapollid = formname.substring(4); // drop the 'form'
        var fieldsetprefix = "vwf" + allalphapollid;
        vwfMessagesCollected = true;
        var spans = document.getElementsByTagName ("DIV");
        for ( var k = 0; k < spans.length; k++ ) {
            var spclass = spans [k].className;
            if ( spclass && spclass=='qerror' ) {
                // find the corresponding qname by looking at parent until we find a fieldset
                var thefieldset = spans [k];
                // if not a fieldset, go up a couple of levels until we find one
                var maxlevels = 5; // can have quite a few
                do {
                    thefieldset = thefieldset.parentNode;
                }
                while ( -- maxlevels > 0 && 'FIELDSET' != thefieldset.tagName && 'TBODY' != thefieldset.tagName && ( 'DIV' != thefieldset.tagName || ! thefieldset.id ) )
                if ( thefieldset == null || ( 'FIELDSET' != thefieldset.tagName && 'TBODY' != thefieldset.tagName && ( 'DIV' != thefieldset.tagName || ! thefieldset.id )  ) ) {
                    continue;
}
                var fieldsetid = thefieldset.id;
                if (  ! fieldsetid )
                    continue;
                // fieldset id is "vwf"+allalphapollid+qname
                if ( fieldsetid.length <= fieldsetprefix.length || fieldsetid.indexOf(fieldsetprefix) != 0 ) {
                    alert ( fieldsetprefix + ' 500' + fieldsetid );
                    continue;
                }
                var fieldqname = fieldsetid.substring(fieldsetprefix.length);
                var qerr = spans[k].innerHTML;
                // Format x=y~z=u~ etc etc
                var items = qerr.split(/[~]/) ; // can't use /n when rendered inside a div by IE, it eats it
                for ( var j = 0 ; j < items.length; j++ ) {
                    var item = items[j];
                    var ps = item.split ( /[=]/ ); // x=y
                    if (  ps.length == 2 && ps[0].length > 0 ) {
                        var key = ps [0] + '-' + fieldqname;    //  key
                        i18nArray [ key ] = ps [1];     //  value
                    }
                }
            }
        }
    }
    var s = null;
    if ( 'inline' == method ) {
        //  substitute certain messages with more appropriate ones
        if ( 'requiredanswer' == msgid )
            msgid = 'presence';
    }

    if ( qname != null ) {
        var msgid2 = msgid ;
        //  Test for VF 7 tags
        if ( msgid2 == 'entervaluebetween' ) msgid2 = 'entervaluebetween2';
        if ( msgid2 == 'entervaluenogreater' ) msgid2 = 'entervaluenogreater2';
        if ( msgid2 == 'entervaluenoless' ) msgid2 = 'entervaluenoless2';
        s = i18nArray[msgid2+'-'+qname];
        if ( s != null )
            return s;
        var plainqname = vwfGetPlainQname (qname);
        if ( plainqname != null ) {
            s = i18nArray[msgid2+'-'+plainqname +'_0']; // the header row
            if ( s != null )
                return s;
        }
    }
    s = i18nArray[msgid];
    if ( s == null || s.length < 1 )
        return msgid;
    return s;
}

function vwfGetPlainQname (elname ) {
    // var elname = theelement.name; // g_text_sec1_ROWa
    if ( ! elname )
        return null;
    // find tthe grid name plus question name -- count back for two _
    var ndash = 0;
    var dash2 = -1;
    for ( var k = elname.length -1 ; k > 0; k-- ) {
        if ( elname.charAt(k) != '_' )
            continue;
        ndash++;
        if ( ndash == 2 )
            dash2 = k;  //  points to the 2nd to last dash
    }
    if ( ndash >= 3 )
        return elname.substring(0,dash2 );   //  g_text
    return null;
}



function GetOptions ( theelement ) {
	try {
    var formid = theelement.formname ; //  formplacenamepollname
    return eval ( "options$"+formid );  //  returns options object, can be null
	} catch (ignored) {
		return null;
	}
}

function postFoundError (msgid, bgroup, group) {
    return postFoundError0 ( msgid, bgroup,group, null, null, null, null );
}

function postFoundError1  (msgid,  elmt, fctn, param1, param2, param3 ) {
    return postFoundError0 ( msgid, false, elmt,  fctn, param1, param2, param3 );
}

function postFoundError0  (msgid, bgroup, group, fctn, param1, param2, param3 ) {

    var theelement = ! bgroup ? group : group [0] ;
    var formid = theelement.formname ; //  formplacenamepollname
    var method = "alert";
	var options = null;
    if ( formid ) {
      try {
	  options = eval ( "options$"+formid );
	  } catch ( ignored ) {}
	  if ( options ) {
		  options.founderrors = true;
		  method = options.methodology;
	  }
    }
    var msg = getMessage ( msgid, method, theelement);
    if ( fctn != null )
        msg = fctn ( msg, param1, param2, param3 ) ;
    return vwfDisplayMessage ( method, theelement, msg, formid, bgroup, group ) ;

}

function vwfDisplayMessage ( method, theelement, msg, formid, bgroup, group, bfieldonly ) {
    if ( 'inline' == method ) {
        //  Ok! This works! Now I need to display this in a neighbouring element somewhere!
        // 1 set the class of the element to make it red
        // 2 set the content of a neighbouring span to the error message. Put the span below the control
        // 3 use the overriding error message provided in the style; perhaps it is pre-rendered in the span for the most common (required) case, and is customizable
        // Span will be below the control, and can be found by its span, which starts with "inlineErrorPlaceholder" and becomes "inlineError"
        var thefieldset = theelement;
        // if not a fieldset, go up a couple of levels until we find one
        var maxlevels = 5; // can have quite a few
        while ( maxlevels-- > 0 && 'FIELDSET' != thefieldset.tagName && 'TBODY' != thefieldset.tagName ) {
            thefieldset = thefieldset.parentNode;
        }
        if ( thefieldset == null || ( 'FIELDSET' != thefieldset.tagName && 'TBODY' != thefieldset.tagName ) )
           return true;
        var errspans = thefieldset.getElementsByTagName("span");
        for ( var k = 0 ; k < errspans.length; k++ ) {
           var thespan = errspans [k];
           if ( thespan.className.indexOf('inlineErrorPlaceholder') < 0 )
               continue;
           thespan.className = 'inlineError';  //  change to visible class
            // put the message there
            thespan.innerHTML = msg;
            if ( bfieldonly )
                break;
            theelement.previousclassName = theelement.className;
            //  Highlight all the elements in the group
            if ( bgroup && group != null ) {
                for ( var kt = 0 ;  kt < group.length; kt++ ) {
                    var thelmt = group [kt];
                    thelmt.className ='elementError';
                }
            }
            else {
                theelement.className ='elementError';
            }
            var thelabel = thefieldset.getElementsByTagName( "label");
            var errorboxid = formid.substring (4) + "-form-error";  //  remove form, leaves spotnameplacename
            var errorsummarydiv = document.getElementById (errorboxid);
            errorsummarydiv.className="inlineError";
            var theerrorhtml = "";
            if ( thelabel != null && thelabel.length > 0 ) {
                var theinsertingfield = thefieldset;
                //  We had a bug here that in a table (fieldset pointing to a tbody) we cannot insert the <a> before the tbody; it confuses chrome and safari.  Not clear exactly where it SHOULD go; but clearly cannot go where it does.
                //  This is peculiar to matrices only, it seems.  There might be a problem with grids and required elements also (much more rare). Problem only shows up when doing DOHs of rows, possibly
                //  Workaround for Chrome and Safari, which get table layout confused when there is an anchor above the TBODY. Putting anchor next to div now
                try {
                    if (theinsertingfield.tagName && theinsertingfield.tagName == 'TBODY') {
                        var thx = theinsertingfield;
                        if (thx.childNodes && thx.childNodes.length > 1) {
                            thx = thx.childNodes[1]; // TR element
                            if (thx.tagName == 'TR' && thx.childNodes && thx.childNodes.length > 0) {
                                thx = thx.childNodes[0]; // TD element
                                if (thx.tagName == 'TD' && thx.childNodes && thx.childNodes.length > 0) {
                                    thx = thx.childNodes[0]; // DIV element
                                    if (thx.tagName == 'DIV') {
                                        theinsertingfield = thx;
                                    }
                                }
                            }
                        }
                        // Old code likely to throw ; use above convoluted thing instead   theinsertingfield = theinsertingfield.childNodes[1] .childNodes[0] .childNodes[0]; // the DIV inside the TD inside the TR
                    }
                } catch(ignored) {}


                //  Add an anchor to the HTML right after the label
                var myanchor = document.createElement("A");
                myanchor.name = theelement.name;
                if ( theelement.type && (theelement.type == 'radio' ||  theelement.type == 'checkbox' ) )
                    theinsertingfield.parentNode.insertBefore ( myanchor,theinsertingfield );
                //  Add question text to the error messages at top of page
                var requiredicon = '* ';    //?? s/b theform, perhaps
                var requirediconelmt = vwfGetNestedElementById ( document.getElementById(formid),  'vwfrequireddataiconsetting' );
                //  var requirediconelmt = document.getElementById ( 'vwfrequireddataiconsetting' );
                if ( requirediconelmt && requirediconelmt.innerHTML && requirediconelmt.innerHTML.length > 0 )
                    requiredicon = requirediconelmt.innerHTML;
                var reqiconlen = requiredicon.length;
                theerrorhtml = thelabel[0].innerHTML;
                if ( ! theerrorhtml  || theerrorhtml.length < 1 ){

                    var elname = theelement.name; // g_text_sec1_ROWa
                    // find tthe grid name plus question name
                    var plainqname = vwfGetPlainQname (elname);
                    if ( plainqname  ) {
                        var gridprefix = "vwf" + theelement.formname.substring (4) ;
                        var colid = gridprefix + plainqname + "_0";
                        if ( document.getElementById ( colid ) )
                            theerrorhtml = document.getElementById ( colid ).innerHTML ;
                        }
                 if ( theerrorhtml.length < 1 )
                    continue;
                }
                if ( theerrorhtml != null && theerrorhtml.length > 0 ) {
                    if ( requiredicon == '*' ) {
                        if ( theerrorhtml.charAt(0) == '*' )
                            theerrorhtml = theerrorhtml.substring(1);
                    }
                    else if ( reqiconlen> 0 ) {
                        if ( theerrorhtml.length > reqiconlen )
                            if ( theerrorhtml.substring(0,reqiconlen) == requiredicon )
                                theerrorhtml = theerrorhtml.substring ( reqiconlen );
                    }
                }

                var  repltoken = "<!--xx-->";
                theerrorhtml = "<li><a href='#xx'>"+theerrorhtml+"</a></li>" + repltoken  ;
                theerrorhtml = theerrorhtml.replace('xx',theelement.name);
                var sofar = errorsummarydiv .innerHTML;
                sofar = sofar.replace ( repltoken, theerrorhtml ) ;
                errorsummarydiv .innerHTML = sofar;

                var theformid = theelement.formname;
                if ( theformid ) {
                    var options = eval ( "options$"+theformid );
                    if  (options)
                        options.nlis ++;
                }
                break;
            }
        }

        return true;
    }
    //  Not inline message
    alert ( msg );

    //noinspection JSUnusedLocalSymbols
    try {
        window.focus();
        if (bgroup)
            group[0].focus();
        else
            group.focus();
    } catch(ignored) {
    }

    return false;
}

function checkQuestionAnswerInRange ( valuelement, valuelow, valuehigh, valuetype ) {
    if ( valuelow == "" && valuehigh == "" )
        return true;
    var valued = valuelement.value;
    var intcompare = valuetype == "2";
    var intvaluelow = 0;
    var intvaluehigh = 0;
    var intvalued = 0;
     var msgid = 'entervaluebetween';
    if ( valuelow == "" )
        msgid = 'entervaluenogreater';
    if ( valuehigh == "" )
        msgid = 'entervaluenoless';
    var bOk = true;
    if ( intcompare ) {
        intvalued = Number ( valued );
        if ( isNaN (intvalued) ) {
            msgid = 'checknumerictextmsg';
            bOk = false;
        }
        intvaluelow = Number ( valuelow );
        intvaluehigh = Number ( valuehigh );
    }
    if ( bOk && valuelow != null && valuehigh != null ) {
        if ( ! intcompare ) {
            if ( valuelow != "" && valued < valuelow )
                bOk = false;
            if ( valuehigh != "" && valued > valuehigh )
                bOk = false;
        }
        else {
            if ( valuelow != "" && intvalued < intvaluelow )
                bOk = false;
            if ( valuehigh != "" && intvalued > intvaluehigh )
                bOk = false;
        }
    }
    if ( bOk )
        return true;

    return postFoundError1 ( msgid, valuelement,vwfReplaceFunction, valuelow, valuehigh, null );
}

var vwfAlertAndFocusElement;
function vwfAlertAndFocus ( msg, element ) {
    if ( ! msg  )
        return;
    alert (msg);
    if ( element ) {
        vwfAlertAndFocusElement = element;
        window.setTimeout( vwfDelayedFocus, 10) ;
        // Theoretically, could use an argument by doing this; the use of vwfAlertAndFocusElement is required by IE
        //  setTimeout("vwfDelayedFocus('"+element.id+"')",10);
        //  Or perhaps this: setTimeout(function(){vwfDelayedFocus(element)},10);
    }
}

function vwfDelayedFocus () {
    if ( vwfAlertAndFocusElement && window ) {
        window.focus();
        vwfAlertAndFocusElement.focus();
    }
    vwfAlertAndFocusElement = null; //  required for garbage collection
}

function vwfQhelper(d) {
    var h = document.getElementById (d); //?? Might be able to use this to get the form id?
    if ( h == null )
        return;
/*
    if ( typeof  h.currentStyle != 'undefined' ) alert ( h.currentStyle.display );
    else if  ( typeof getComputedStyle != 'undefined' ) alert ( getComputedStyle(h,null) . display); // returns none, correctly!
*/
    var v = 'none'; //  just in case
    if ( typeof  h.currentStyle != 'undefined' ) v = h.currentStyle.display ;
    else if  ( typeof getComputedStyle != 'undefined' ) v = getComputedStyle(h,null) . display;
    var flip;
    flip = v == 'none' ? 'block' : 'none';
    h.style.display = flip;
}

function vwfQlengthchecker(txt,slimit) {
	if ( slimit == null || ''==slimit )
		return;
	var limit = 0 + slimit;// just in case, turns it numeric
	var nulength = txt.value.length;
	if ( nulength > limit )
		txt.value = txt.value.substring (0,limit);
}


function vwfTxtAdjustHeight (elemt) {
    if ( elemt == null || elemt.cols == null )
        return;
	var TxtMinCols = 10;
	var TxtMinRows = 2;
    var cols = elemt.cols;
    if ( cols < TxtMinCols )
        return;
    var lines = elemt.value.split('\n');
    var nlines = 0;
    for ( var k=0; k < lines.length; k++ ) {
        var thisline = lines [k];
        var linesinthisline = Math.floor ( ( thisline.length + cols - 1 ) / cols ) ;
        if ( linesinthisline == 0 )
            linesinthisline = 1;
        nlines += linesinthisline;
    }
    if ( nlines < TxtMinRows )
        nlines = TxtMinRows ;
    if ( nlines != elemt.rows ) {
        elemt.rows = nlines;
    }
}

function vfRadio (f,elname,bOther,skipTo) { return; }
function vfRadioOther (f,elname,bOther,skipTo) {
   for ( var k = 0 ; k < f.elements.length; k++ ) {
      var e = f.elements[k];
      if ( ! bOther) {
         if ( e != null && e.name==elname && e.type == "text" ) {
            e.value = "";
            break;
            }
         }
      else {
          var otherradiobutton = document.getElementById(elname + "-other")
         if ( e != null && e.name==elname && e.type == "radio" && e.value == "" && ( otherradiobutton != null && otherradiobutton.id == e.id ) ) {
            e.checked = true;
            break;
         }
      }
   }
}

function Cogix_Print_Adjustments (div) {
    if ( document.all ) {   //IE
        // convert fieldset attributes
        if ( ! div )
            return;
        var fsets = div.getElementsByTagName('fieldset')
        if ( ! fsets || fsets.length < 1 )
            return;
        for ( var k =  0; k < fsets.length; k++ ) {
            var fs = fsets [k];
            if ( fs.style.borderStyle == 'none' )
                fs.style.borderWidth = 0;
        }
    }
    Cogix_Submit_Setup();
}

// qpropertydateformat = "[/qproperty,dateformat,m/d/y]";

function vwfCheckDate(dateelmt, qpropertydateformat) {
   if ( dateelmt == null || dateelmt.value == "" ){
		return true;
   }
	var formid = dateelmt.formname ; //  formplacenamepollname
    var method = 'alert';	//	default
	try {
		var options = eval ( "options$"+formid );
		if ( options )
    		method = options.methodology;
	} catch (ignored) {}

   var dateStatus = vwfIsValidDate(dateelmt.value, qpropertydateformat, method, dateelmt);
   if ( dateStatus == null ){
      return true;
   } else {
	   if ( typeof options != 'undefined' && options )
       		options.founderrors = true;

       return vwfDisplayMessage ( method, dateelmt, dateStatus, formid, false, dateelmt ) ;
        // vwfAlertAndFocus ( dateStatus, dateelmt );
        // return false;
   }
}

function vwfIsValidDate(dateStr, qpropertydateformat,method,theelement) {

    var messages = getMessage ( 'checkvaliddatemsg', method, theelement);
    if ( ! messages )
        messages = "Use only numbers in Dates, in format %X|%1 must be between %2 and %3; format is %X|Day|Month|Year|m/d/y";
    var msgs = messages.split("|");
    if ( msgs.length < 5 )
        return "Date error string must contain all 5 elements";
    var lDay = "Day";
    var lMon = "Month";
    var lYer  = "Year";
    if ( msgs.length > 4 ) {
        lDay = msgs[2]; // Day
        lMon = msgs[3]; // Month
        lYer = msgs[4]; // Year
    }
    var defaultdateformat = null;
    if ( msgs.length > 5 )
        defaultdateformat  = msgs[5];    //  default date format for this language

    var dateformat = "m/d/y";
    if ( qpropertydateformat != "" ) {
        dateformat = qpropertydateformat;
    } else {
        if ( defaultdateformat != "" )
            dateformat = defaultdateformat;
    }
    dateformat = dateformat.toLowerCase();
    var monpart, daypart, yerpart;
    var monlen,  daylen,  yerlen ;
    var dateslash = dateformat.split('/');
    var datedash  = dateformat.split('-');
    var dateperd  = dateformat.split('.');
    if ( dateslash.length > 1 && datedash.length > 1 && dateperd.length > 1)
        return "Date format must have three parts separated by slash, dash, or dot, and cannot mix them.";
    if ( dateslash.length + datedash.length + dateperd.length != 5 )
        return "Date format must have three parts separated by slash, dash, or dot, and cannot mix them.";
    var splitchar = '/';
    var splitdateformat = dateslash;
    if ( datedash.length == 3 ) {
        splitchar = '-';
        splitdateformat = datedash;
    }
    else if ( dateperd.length == 3 ) {
        splitchar = '.';
        splitdateformat = dateperd;
    }
    else if ( dateslash.length != 3 )
        return "Date format must have three parts separated by slash, dash, or dot, and cannot mix them.";

    // calc monthpart,daypart,yearpart and assign monthlen, daylen, yearlen
    var sample = "";
    var first = splitdateformat [0] ;
    switch ( first.charAt (0) ) {
        case 'm': monpart = 0; monlen = first.length; sample += "12"; break;
        case 'd': daypart = 0; daylen = first.length; sample += "31";  break;
        case 'y': yerpart = 0; yerlen = first.length; sample += "2008"; break;
    }
    sample += splitchar;
    var second = splitdateformat [1] ;
    switch ( second.charAt (0) ) {
        case 'm': monpart = 1; monlen = second.length; sample += "12";break;
        case 'd': daypart = 1; daylen = second.length; sample += "31";  break;
        case 'y': yerpart = 1; yerlen = second.length; sample += "2008";break;
    }
    sample += splitchar;
    var third = splitdateformat [2] ;
    switch ( third.charAt (0) ) {
        case 'm': monpart = 2; monlen = third.length; sample += "12";break;
        case 'd': daypart = 2; daylen = third.length; sample += "31";  break;
        case 'y': yerpart = 2; yerlen = third.length; sample += "2008";break;
    }
    if (yerlen == 2 )
        sample = sample.replace("2008","08") ;
    //  replace %X with sample date
    msgs [0] = msgs[0].replace ( "%X",sample); // Use only numbers in dates, in format %X
    msgs [1] = msgs[1].replace ( "%X",sample); // Format is %X

    //  Check the date format
    var dateParts = dateStr.split(splitchar);
    if ( dateParts.length != 3 )
        return msgs[0];
    var month = dateParts[monpart];
    var day   = dateParts[daypart];
    var year  = dateParts[yerpart];

    if ( !isValidDateNumericField(day) || !isValidDateNumericField(month) || !isValidDateNumericField(year) )
        return msgs[0];

    var monmin= monlen == 2 ? "01" : "1";
    var daymin = daylen == 2 ? "01" : "1";


    if ( month < 1 || month > 12 )  {
        return isValidDateSubstitute3 ( msgs[1], lMon,monmin, "12");  //"Month must be between 1 and 12";
    }
    if ( monlen == 2  && month.length != monlen ) {
        return isValidDateSubstitute3 ( msgs[1], lMon,"01", "12");  //"Month must be between 01 and 12";
    }

    if ( yerlen == 2  && year.length != yerlen )
        return isValidDateSubstitute3 ( msgs[1], lYer,"00","99"); //"Year must be between 00 and 99
    if ( yerlen == 4  && year.length != yerlen )
        return isValidDateSubstitute3 ( msgs[1], lYer,"1900","2100"); //"Year must be between 1900 and 2100

    var yyThreshold = 20; // two digit year threshold. <= add to 2000, > add to 1900
    if ( year.length == 2 ){
        var iyear = parseInt(year);
        if ( iyear <= yyThreshold ) {
            iyear = 2000 + iyear;
        } else {
            iyear = 1900 + iyear;
        }
        year = "" + iyear;
    }
/*
    var minYear = 1900;
    var maxYear = 2100;
    if ( year < minYear || year > maxYear )
        return isValidDateSubstitute3 ( msgs[1], lYer,minYear, maxYear );  //"Year must be between "+minYear+" and "+ maxYear;//1
*/

    var maxDayOfMonth = 31;
    if ( month == 4 || month == 6 || month == 9 || month == 11 )
        maxDayOfMonth = 30;
    if ( month == 2 ) {
        maxDayOfMonth = 28;
        if ( year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) )
            maxDayOfMonth = 29;
    }

    if ( day < 1 || day > maxDayOfMonth )
        return isValidDateSubstitute3 ( msgs[1], lDay,daymin, maxDayOfMonth);   //"Day must be between 1 and " + maxDayOfMonth;  //1
    if ( daylen == 2  && day.length != daylen )
        return isValidDateSubstitute3 ( msgs[1], lDay,"01", maxDayOfMonth);   //"Day must be between 1 and " + maxDayOfMonth;  //1
    return null;
}

function isValidDateNumericField (val){
   var numbers = "0123456789";
   for ( var i=0; i < val.length; i++){
      if ( numbers.indexOf(val.charAt(i)) < 0 ) return false;
   }
    return true;
}

function isValidDateSubstitute3 ( s,one,two,three ) {
    s = s.replace(/%1/g,one);
    if ( two != null )
        s = s.replace(/%2/g,two);
    if ( three != null )
        s = s.replace(/%3/g,three);
    return s;
}

//  qpropnumberseparator = '[/qproperty,numberseparator,.]' ;
//  qpropnumberdecimals =    [/qproperty,numberdecimals,0] ;
function vwfCheckNumber (numberelement,low,high,qpropnumberseparator, qpropnumberdecimals) {
    if ( numberelement == null || numberelement.value == null )
        return true;
    if ( numberelement.value == "" )
        return true;
    var bOk = true;
    var numberseparator = '.';
    if ( qpropnumberseparator != '' )
        numberseparator  = qpropnumberseparator;
    var numberdecimals = 0;
    if ( qpropnumberdecimals != '' )
        numberdecimals  = qpropnumberdecimals;
    var absnumberdecimals = numberdecimals > 0 ? numberdecimals   : -numberdecimals  ;
    var bSeparator = false;
    var ndec = 0;
    var samplenumber = "1234";
    if ( numberdecimals != 0 ) {
        samplenumber += numberseparator;
        for ( var jj = 0; jj < absnumberdecimals; jj++ )
            samplenumber += '0';
    }
    for ( var k = 0 ; bOk && k < numberelement.value.length; k++ ) {
        var chx = numberelement.value.charAt (k);
        if ( chx == numberseparator  ) {
            if ( numberdecimals == 0 ) {
                bOk = false;
            }
            else {
                if ( bSeparator )
                    bOk = false;
                else {
                    bSeparator = true;
                }
            }
        }
        else if ( chx == '+' || chx == '-' ) {
            if ( k != 0 )
                bOk = false;  //   + or - can only be at the beginning
        }
        else if ( chx < '0' || chx > '9' ) {
            bOk = false;
        }
        else {
            if ( bSeparator ) {
                ndec ++;
                if ( ndec > absnumberdecimals ) {
                    bOk = false;
                }
            }
        }
    }

    if ( numberdecimals == 0 && bSeparator )
        bOk = false;    //  1. and 1, not allowed
    if (numberdecimals > 0 && ( ! bSeparator || absnumberdecimals != ndec ) )
        bOk = false;    //  exactly that many digits required
    if ( numberdecimals < 0 && ( bSeparator &&  ( ndec == 0 || absnumberdecimals < ndec ) ) )
        bOk = false;    //  up to that many digits required
    if ( bOk ) {
        return checkQuestionAnswerInRange ( numberelement, low, high, 2);
    }
    else {
        return postFoundError1 ( 'checknumbermsg' , numberelement, vwfReplaceFunction, samplenumber, null, null );
    }
}

function vwfReplaceFunction ( msg, param1, param2, param3 ) {
    if ( param1 != null )
        msg = msg.replace ("%1",param1);
    if ( param2 != null )
        msg = msg.replace ("%2",param2);
    if ( param3 != null )
        msg = msg.replace ("%3",param3);
    return msg;
}

function vwfCheckEmail (emailelement) {
    var formid = emailelement.formname ; //  formplacenamepollname
    var method = 'alert';	//	default
	try {
		var options = eval ( "options$"+formid );
		method = options.methodology;
	} catch (ignored) {}
   var emailStatus = vwfCheckEmailS(emailelement.value, method,emailelement);
   if ( emailStatus == null ) {
        return true;
   }
   if ( typeof options != 'undefined' && options )
		options.founderrors = true;
    return vwfDisplayMessage ( method, emailelement, emailStatus, formid, false, emailelement ) ;
}

function vwfCheckEmailS ( s, method, theelement) {
    var kAt = -1;
    var kPeriod = -1;
    if ( s == null || s == "" )
        return null;
    var len = s.length;
    for ( var k = 0; k < len ; k ++ ) {
        // Check for alpha a-z, numeric, period, @ symbol, _ and -
        var ch = s.charAt (k);
        var bValid = false;
        if ( ch >= 'a' && ch <= 'z' ) bValid = true;
        else if ( ch >= 'A' && ch <= 'Z' ) bValid = true;
        else if ( ch >= '0' && ch <= '9' ) bValid = true;
        else if ( ch == '-' ) bValid = true;
        else if ( ch == '_'  && kAt == -1 ) bValid = true; // these are only valid in the local address, not domain
        else if ( ch == '+'  && kAt == -1 ) bValid = true;
        else if ( ch == '\'' && kAt == -1 ) bValid = true;
        else if ( ch == '@' ) {
            bValid = true;
            if ( kAt >= 0 )
                return  getMessage ( 'checkemailmsg', method, theelement); // was msg1
            kAt = k;
        }
        else if ( ch == '.' ) {
            bValid = true;
            if ( kAt >= 0 )
                kPeriod = k;
        }
        if ( ! bValid ) {
            //noinspection UnnecessaryLocalVariableJS
            var xmsg = getMessage ( 'checkemailmsg', method, theelement);// was msg2
            return xmsg.replace ("%1",ch);
        }
    }
    if ( kAt < 0 )
        return  getMessage ( 'checkemailmsg', method, theelement);//was msg3
    if ( kAt == 0 )
        return  getMessage ( 'checkemailmsg', method, theelement);//was4
    if ( kPeriod < 0 )
        return  getMessage ( 'checkemailmsg', method, theelement);//was5
    if ( kPeriod - kAt < 2 )
        return  getMessage ( 'checkemailmsg', method, theelement);//was6
    if ( len - kPeriod < 2 )
        return  getMessage ( 'checkemailmsg', method, theelement);//was7
    return null;
}


function CogixDynamicGrid (tableid, numbervisible,linkrowid) {
    //  -N is initial call to set the number visible; +N is to show that many more
    try {
        if ( '' == tableid )
            return;
        var setted = '';
        var nowvisible = 0;
        var hidden = 0;
        var revealed = 0;
        var tbl = document.getElementById (tableid);
        var rws = tbl.getElementsByTagName ("TR");
        if ( rws.length < 2 ) return;
        //  Find the 1st row above the More link that has cogixgridrow

        var j = 0;
        for (  ; j < rws.length; j++ ) {
            if ( rws[j].id == linkrowid )
                break;
        }
        //  row j has the more link
        var div = rws[j];
        var limit = j;
        for ( --j ; j > 0; j-- ) {
            if ( rws[j].className != "cogixgridrow" )
                break;
        }
        //  row j is one above the beginning
        //  var k = 0;
        var k = j;

        for ( ; k < limit ; k++ ) {
            var row = rws [k];
            if ( row.className != "cogixgridrow" )
                continue;
            if ( row.id && row.id.lastIndexOf('_0') == row.id.length -2 ) {
                continue;
            }
            if ( numbervisible < 0 ) {
                //  Initial call, set as many rows as possible to visible and the remainder to invisible
                if ( ++nowvisible  > - numbervisible ) {
                    // Test that all input elements in the row have no values, if possible...
                    if ( CogixDynamicGridHasData ( row ) )
                        continue;
                    row.style.display = "none";
                   setted += CogixDynamicGridRevealHide (row, "1" );
                    hidden++;
                }
            }
            else {
                //  Incremental call, set this many invisible rows to visible
                if ( row.style.display != 'none' )
                    continue;
                if ( ++nowvisible > numbervisible )
                    break;
                row.style.display = "";
                setted += CogixDynamicGridRevealHide (row, "0" );
                revealed ++;
            }
        }
        if ( numbervisible < 0 ) {
            if ( hidden < 1 )   //  nothing was hidden
                div.style.display='none';
        }
        else {
            if ( revealed < 1 || k >= limit )   //  nothing was revealed
                div.style.display='none';
        }
    } catch( ignored ) {
        ignored = null;
    }
    //  if ( setted != '' ) alert (setted);
}

function CogixDynamicGridHasData ( row ) {
    try {
        //  get all the elements
        var elmtlist = new Array();
        CogixDynamicGrid2 ( row,   elmtlist );
        /*
            var sss = "";
            for ( var z = 0 ; z < elmtlist.length; z++ )
                  sss += elmtlist [z];
            alert ( sss );
            window.status = elmtlist.length;
        */
        return elmtlist.length > 0;
    } catch(ignored) {
        ignored = null;
        return true;
    }
}

//  return true if any elements in the row have a value
function CogixDynamicGrid2 ( obj , arr ) {
    for (var i=0; i<obj.childNodes.length; i++) {
        var childObj = obj.childNodes[i];
        if ( childObj.tagName) {
            if ( childObj.type ) {
                var tag = childObj.tagName ;
                if ( "INPUT"==tag  && childObj.type ) {
                    if ( ( childObj.type == "text" || childObj.type == "hidden" ) && childObj.value && childObj.value != '' ) {
                        arr [ arr.length] = childObj.value;
                    }
                    if ( childObj.type == "radio" && childObj.checked ) {
                        arr [ arr.length] = childObj.value;
                    }
                    if ( childObj.type == "checkbox" &&  childObj.checked ) {
                        arr [ arr.length] = childObj.value;
                    }
                }
                else if ( "SELECT"==tag && childObj.selectedIndex &&  childObj.selectedIndex > 0 )
                    arr [ arr.length] = childObj.selectedIndex;
                else if ( "TEXTAREA"==tag && childObj.value && childObj.value != '' )
                    arr [ arr.length] = childObj.value;
            }
        }
        CogixDynamicGrid2 ( childObj, arr );
    }
}

function CogixDynamicGridRevealHide ( row, on ) {
    //  Set     ShowAndHide_HiddenQuestions [ qname ] = "1" for all questions that are in the hidden row
    var set = "";
    set += CogixDynamicGridRevealHide2 ( row.getElementsByTagName("INPUT"), on);
    set += CogixDynamicGridRevealHide2 ( row.getElementsByTagName("SELECT"), on);
    set += CogixDynamicGridRevealHide2 ( row.getElementsByTagName("TEXTAREA"), on);
    return "setting to " + on +": "  + set;
}

function CogixDynamicGridRevealHide2 ( elemts, on ) {
    if ( ! elemts || elemts.length < 1 )
        return "";
    var setted = "";
    for ( var k = 0 ; k  < elemts.length; k++ ) {
        var elmt = elemts[k];
        var qname = null;
        if ( elmt.type ) {
            qname =elmt.name;
        }
        else{
            if ( elmt.length && elmt.length > 0 ) {
                qname = elmt [0].name;
            }
        }
        if ( qname ) {
            setted+= " " + qname;
            if ( ! window.ShowAndHide_HiddenQuestions )
                window.ShowAndHide_HiddenQuestions = new Object ();
            window.ShowAndHide_HiddenQuestions [ qname ] = on;
        }
    }
    return setted;
}

/*
CogixColorRows ( id, classofrowstocolor,color1,colr2)
when id is null, all tables on page are colored
classofrowstocolor is optional, use '' to include all rows in table
so are color1 and color2
 */
function CogixColorRows ( color1, color2, id , colorclass) {
    var table = null;
    if ( !colorclass  || colorclass == null )
        colorclass = '';
    if ( !color1  || color1 == null )
        color1 = '#FFFFFF';
    if ( !color2  || color2 == null )
        color2 = '#DDDDDD';

    if ( id == null ) {
        var tables = document.getElementsByTagName ("TABLE");
        if ( ! tables || tables.length < 1 )
            return;
        for ( var j = 0 ; j < tables.length; j++ ) {
            CogixTableRows2  ( tables[j] , colorclass, color1, color2 ) ;
        }
    }
    else {
        table = document.getElementById(id) ;
        CogixTableRows2 (table , colorclass, color1, color2 )
    }
}

function CogixTableRows (tableid , colorclass, color1, color2 ) {
    CogixTableRows2 ( document.getElementById (tableid) , colorclass, color1,color2 );
}

function CogixTableRows2 (table , colorclass, color1, color2 ) {
    var n = 0;
    if ( ! table )
        return;
    var rows = table.getElementsByTagName('TR');
    if ( ! rows )
        return;
    for ( var k = 0 ; k < rows.length; k++ ) {
        var row = rows [k];
        if ( ! row || ( colorclass != '' && row.className != colorclass ) )
            continue;
        var color = ( n % 2 == 0 ) ? color1 : color2 ;
        n++;
        row.style.backgroundColor = color;
        /*
                //  Also set the style.backgroundColor of all input elements in the row, for IE in Liferay
                var theinputs = row.getElementsByTagName("INPUT");
                for ( var j = 0 ; theinputs != null && ( j < theinputs.length ); j++ ) {
                    var theinpl = theinputs [j];
                    theinpl .style.backgroundColor = color;
                }
        */
    }
}

/*
Use this to do it to every element on the current form.  types and formid can be omitted
- pixels is optional and recommended, and indicates the width to use for the question text
   if not used, then elements will not have a consistent alignment
- types is any ONE of the letters t,r,c,s,a  for input-text,radio,checkbox, select, and text areas respectively, or x for anything
   If ommitted, all text, dropdowns, and text area elements are aligned
- formid is required when there is more than one form on the page. Get the formid from the survey's form tag.

	Sample use:
	Create an HTML question with this javascript: CogixHorizontalAll (200) and place as the last question on  the page
*/

function CogixLegendAll (pixels, types, formid) {
    if ( ! types )
        types = "x";
    else {
        if ( types.length != 1 ) {
            alert ( 'CogixHorizLabelAll types must be a single letter: t,c,r,s,a');
            return;
        }
    }
    var fsets;
    if ( ! formid )
        formid = vwfCurrentFormId();
    if ( ! formid )
        fsets = document.getElementsByTagName("FIELDSET");
    else {
        var theform  = document.getElementById(formid);
        if ( ! theform )
            return ;
        fsets = theform.getElementsByTagName("FIELDSET");
    }
    if ( ! fsets )
        return;
    for ( var fsx = 0 ; fsx <fsets.length; fsx ++ ) {
        var fs = fsets [fsx];
        //  The fieldset must have an id that starts with "vwf"
        CogixHorizLabelFieldSet  ( fs, pixels, types );
    }

}

function vwfFindFieldSet ( qname, formid ) {
    if ( ! qname || qname.length < 1 )
        return null;
    // Find form
    if ( ! formid )
        formid = vwfCurrentFormId();
    if ( ! formid ) {
        if ( ! document.forms ||   document.forms.length < 1 || ! document.forms [0] )
            return null;
        formid = document.forms [0].id;
    }
    var theform = document.getElementById(formid);
    if ( ! theform )
        return null;
    // formid id is formtestallstyles;  subtract form = testallstyles
    // fieldset id is vwftestallstylesage2; subtract vwf + testallstyles, get age2, the question name
    if ( formid.length < 5 || formid.substr(0,4) != 'form' )
        return null;   //  Not a ViewsFlash form
    var allalphapollid = theform.id.substring (4);  //  remove form, get testallstyles
    var fieldsetprefix = "vwf" + allalphapollid;
    var fieldid = fieldsetprefix + qname ;
    return document.getElementById(fieldid);//?? s/b theform
}

function CogixAnswerColumns ( qname, pixels, formid) {
    var fs = vwfFindFieldSet ( qname,formid ) ;
    if ( ! fs ) return;
    var divs = fs.getElementsByTagName("DIV");
    if ( ! divs ) return;
    if ( ! divs.length) return ;
    if ( divs.length < 2 ) return ;
    if ( !pixels )
        pixels = 180;
    for ( var k = 0 ; k < divs.length ; k++ ) {
        var thediv = divs[k];
        if ( ! thediv || thediv.className != 'multicolumninputfield' )
            continue;
        thediv.style.width = pixels+"px";
    }
}


function CogixAnswColValue (div) {
    var labels = div.getElementsByTagName('label')
    if (!labels || labels.length<1) return ''
    return labels[0].innerText
}

function CogixAnswCompareLabels (a,b) {
    var va = CogixAnswColValue(a)
    var vb = CogixAnswColValue(b)
    var c =  va.localeCompare(vb)
    return c
}

// Sorts radio buttons and checkboxes alphabetically in multiple columns
function CogixAnswerColumnsSorted(qname, pixels, formid) {
    var fs = vwfFindFieldSet(qname, formid);
    if (!fs) return;
    var maindiv = fs.children
    if ( !maindiv || maindiv.length < 2)
        return
    if ( ! pixels )
        pixels = 180
    var all = maindiv [1] // s/b no classname
    var divs = all.children
    var divarr = Array.prototype.slice.call(divs)
    divarr.sort ( CogixAnswCompareLabels )

    var pl = parseFloat(window.getComputedStyle(fs, null).getPropertyValue('padding-left') )
    var pr = parseFloat(window.getComputedStyle(fs, null).getPropertyValue('padding-right') )
    var fw = fs.clientWidth - 0.01 - pl - pr
    var ncols  = Math.floor (fw/pixels)
    var nels   = divarr.length
    var nahead = Math.ceil (nels/ncols)
    var nrows  = nahead
    while (all.firstChild) all.removeChild(all.firstChild)
    // console.log(fw, pixels, ncols,nels,nahead,nrows,divs.length)
    for ( var k = 0 ; k < nrows ; k += 1 ) {
        for ( var j = 0 ; j < ncols; j++ ) {
            var kp = k + nahead * j
            var thediv = divarr [ kp ]
            if ( thediv ) {
                thediv.style.width = pixels + "px"
                all.appendChild(thediv)
            }
        }
    }
}

//  Use this to set a particular question to horizontal alignment with a specific (optional) width and a disambiguating formid if needed
function CogixLegend (qname, pixels, formid) {
    if ( ! qname || qname.length < 1 )
        return ;
    var allalphapollid = CogixQuestionPrefix ('',qname,formid); // theform.id.substring (4);  //  remove form, get testallstyles
    if ( ! allalphapollid )
        return;
    var fieldsetprefix = "vwf" + allalphapollid;
    var fieldid = fieldsetprefix + qname ;
    var fs = document.getElementById(fieldid);   //?? should be theform
    CogixHorizLabelFieldSet (fs, pixels,'x');
}

// Internal method, do not use
function CogixHorizLabelFieldSet  ( fs, pixels, types ) {
    //  The fieldset must have an id that starts with "vwf"
    if ( ! fs.id )
        return;
    var fsid = ""+fs.id;
    if ( fsid.length < 4 || fsid.substr(0,3) != 'vwf' )
        return;
        //  The fieldset must contain one div and one element of the indicated types
    var divs = fs.getElementsByTagName("DIV");
    if ( ! divs || divs.length < 1 )
        return;

    var elmts = null;
    var types0 = types.charAt(0);
    switch ( types0) {
        case 'x':   // anything except a hidden field
            elmts = fs.getElementsByTagName("INPUT");
            if ( ! elmts || elmts.length < 1 )
                break;
            var etypeh = elmts[0].type;
            if ( ! etypeh )
                break;
            if ( etypeh == 'hidden' )
                return;
            break;
        case 'a':   //  textarea
            elmts = fs.getElementsByTagName("TEXTAREA");
            if ( ! elmts || elmts.length < 1 )
                return;
            break;
        case 's':   //  select-one
            elmts = fs.getElementsByTagName("SELECT");
            if ( ! elmts || elmts.length < 1 )
                return;
            break;
        case 'r':   //  checkboxes and radio buttons the same
        case 'c':   //  checkboxes and radio buttons the same
        case 't':   //  input / text
            elmts = fs.getElementsByTagName("INPUT");
            if ( ! elmts || elmts.length < 1 )
                return;
            var etype = elmts[0].type;
            if ( ! etype ) return;
            if ( etype == 'hidden' )
                return;
            switch ( types0 ) {
                case 'r':   //  radio buttons
                    if ( etype != 'radio' ) return;
                    break;
                case 'c':   //  checkboxes and radio buttons the same
                    if ( etype != 'checkbox' ) return;
                    break;
                case 't':   //  input / text
                    if ( ! vwfistypeText (etype) ) return;
//??                    if ( etype != 'text' ) return;
                    break;
            }
            break;
        default: return;
    }

    // In the div, set float:left and width:pixels (if set)
    var thediv = divs [0];
    thediv.style.cssFloat = 'left'; //  styleFloat in IE6
    thediv.style.styleFloat = 'left';
    if ( pixels ) {
        var abspixels = pixels > 0 ? pixels : - pixels ;
        if ( abspixels > 0 )
            thediv.style.width = ""+ abspixels  + "px";
        //  negative pixels means find the label within, if any, and give it style text-align:right
        if ( pixels < 0 ) {
            thediv.style.textAlign="right";
            thediv.style.marginRight="2px";
        }

    }
}

function vwfistypeText (t) {
    if ( t == 'text' ) return true;
    if ( t == 'search' ) return true;
    if ( t == 'number' ) return true;
    if ( t == 'range' ) return true;
    if ( t == 'color' ) return true;
    if ( t == 'tel' ) return true;
    if ( t == 'url' ) return true;
    if ( t == 'email' ) return true;
    if ( t == 'date' ) return true;
    if ( t == 'month' ) return true;
    if ( t == 'week' ) return true;
    if ( t == 'time' ) return true;
    if ( t == 'datetime' ) return true;
    if ( t == 'datetime-local' ) return true;
    return false;
}

// 70 new way of doing handlers
function vwfEventsList () {
    function addEvent ( kind, id, handler ) {
        //noinspection UnnecessaryLocalVariableJS
        var newevent = new vwfEvent();
        newevent.createEvent ( kind,id,handler);
        this.EventsList [ this.EventsList.length ]  = newevent;
    }
    function dump () {
        var msg = "";
        for ( var k = 0 ; k  < this.EventsList.length; k++ ) {
            msg += this.EventsList [k].showEvent() + "\r\n";
        }
        alert ( msg );
    }
    function findEvents ( id ) {
        var foundevents = new Array ();
        if ( ! id )
            return foundevents;
        for ( var k = 0 ; k  < this.EventsList.length; k++ ) {
            var ev = this.EventsList [k];
            if ( ev.sid == id ) {
                foundevents [ foundevents.length ] = ev;
            }
        }
        return foundevents;
    }
    this.EventsList = new Array ();
    this.addEvent = addEvent;
    this.dump = dump;
    this.findEvents = findEvents;
}

//  Usage: new vwfEvent().createEvent ( 1, "AGBAkind" )
//  vwfEventsListObject.addEvent ( 1, "AGBAkind" )
function vwfEvent () {
    /* These would have been global variables. Object variables must be explicitly referenced as this.kind, etc !
        var kind;  //  1=DisplayOrHide handler, 2=Calculate handler, others are future.   0=onchange, 128=onclick
        var sid;    //  event ID; the proper handler will deal with it
        var handler;    //  could we put the function here?
    */
    function createEvent ( kinda, ida, handlera) {
        this.kind = kinda;
        this.sid = ida;
        this.handler = handlera;
    }
    function showEvent () {
        var handlershort = new String ( this.handler ).substring ( 0, 30 );
        return ( this.kind +' '+ this.sid + ' '+handlershort );
    }
    this.createEvent = createEvent;
    this.showEvent = showEvent;
}

function vwfGetUpdatedHandler ( elmt, onhandler ) {
    if ( onhandler ) {
        var handlerastext =  new String ( onhandler );
        var existinghandler = vwfGetFunctionMeat ( handlerastext );
        if ( existinghandler.indexOf ('vwfEventHandler') < 0 ) {
            if ( typeof window.ShowAndHide_SavedHandler  == 'undefined' )
                window.ShowAndHide_SavedHandler = new Object ();
            window.ShowAndHide_SavedHandler [ elmt.id ] = existinghandler; //  save the handler
            return function () {
//debugger;
                eval ( window.ShowAndHide_SavedHandler [this.id] ) ;
                vwfEventHandler(this);
            } ;
        }
    }
    return function () { vwfEventHandler(this);  } ;
}

function vwfShowAndHide_StartsWith ( s, startswith ) {
    if ( s.length < startswith.length )
        return false;
    return s.substring(0,startswith.length) == startswith ;
}


function vwfGetFunctionMeat (s) {
    if ( !s || s.length < 1 )
        return '';
    if ( ! vwfShowAndHide_StartsWith ( s, "function "  ) )
        return '';
    var ib1 = s.indexOf('{');
    var ib2  = s.lastIndexOf('}');
    if ( ib1 < 0 || ib2 < 0 )
        return '';
    return s.substring ( ib1+1, ib2 ) ;
}

//  Find all events associated with this element and fire them off
// This function is called from the generated onchange, onclick, onkeyup handlers that Calculate and DisplayOrHide put into place

function vwfEventHandler (elmt) {
//    debugger;
    var theform = elmt.form;
    if ( ! theform ) return;
    // theform.name could have been overriden by a field called 'name'
    var theformnam = theform.getAttribute('name')
    if ( ! theformnam ) return;
    var elmtname = elmt.name;
    if ( ! elmtname ) return;
    //  find ALL the events that exist for this control and trigger all of them !!!
    var theevents = window.vwfEventsListObject.findEvents ( theformnam+'!'+elmtname ); //  a vwfEvent
    for ( var k = 0; k < theevents.length; k++ ) {
        var theEvent = theevents [k];
        if ( ! theEvent ) return;
        if ( typeof vwfEventsExclude  != 'undefined' && vwfEventsExclude && vwfEventsExclude == theEvent.kind )
            continue; //  exclude these events
        if ( typeof vwfEventsInclude != 'undefined' && vwfEventsInclude && vwfEventsInclude != theEvent.kind )
            continue; //  include only these events

        theEvent.handler ( elmt );
    }

}

function CogixLayout  ( firstquestion, lastquestion, height,width,styleattributes,formidfordisambiguation ) {
    // looking for vwfPracticelayoutfull_name
    // how do I know place,etc? Look for a form with action viewsflash/vfadmin. Its name will be formPracticelayout. If more than one such form, look for the field and if disambig needed, ask for last parameter
    // Question - how to deal with HTML questions?
    var theform = CogixQuestionForm ( 'CogixLayout', firstquestion, formidfordisambiguation);
    var prefix = CogixQuestionPrefix('CogixLayout', firstquestion, formidfordisambiguation)
    var q1 = 'vwf'+prefix+firstquestion;
    var q2 = 'vwf'+prefix+lastquestion;
    var fs1 = document.getElementById(q1);  //?? s/b the form
    var fs2 = document.getElementById(q2);  //?? s/b the form
    if ( !fs1) { alert ( 'CogixLayout - question '+firstquestion+'does not exist. Misspelled?');  return; }
    if ( !fs2) { alert ( 'CogixLayout - question '+lastquestion+'does not exist. Misspelled?');  return; }

    // I want thenodes to be the parent of the first node.
    //  var thenodes = theform.childNodes;
    var thenodes = fs1.parentNode.childNodes;
    var j1 = -1;
    var j2 = -2;
    for ( var j = 0 ; j < thenodes.length; j++ ) {
        var thisfs = thenodes [j];
        if ( thisfs.id && thisfs.id == q1 ) j1 = j;
        else if ( thisfs.id && thisfs.id == q2 ){  j2 = j;  }
    }
    if ( j1 < 0 ) { alert ( 'CogixLayout - question '+firstquestion+'could not find node. Has Standard_\'s DOM been modified?');  return; }
    if ( j2 < 0 ) { alert ( 'CogixLayout - question '+lastquestion+'could not find node. Has Standard_\'s DOM been modified?');  return; }

    //  be careful that we don't change the DOM until we've got all references we need!

    var thenewdiv = document.createElement("DIV");
    if ( typeof CogixShortTermQnameForJs != 'undefined' && CogixShortTermQnameForJs != null )
        thenewdiv.id = CogixShortTermQnameForJs;  // defined in Standard style
    thenewdiv.style.position='relative';
    CogixSetStyleAttributes (thenewdiv, styleattributes);
    //    thenewdiv.style.backgroundColor ='#0000C0'; // this definitely works
    //    thenewdiv.style [ 'background-color' ] = '#0000C0' ; this definitely does NOT work
    if ( height )
        thenewdiv.style.height=height+'px';
    if ( width )
        thenewdiv.style.width = width +'px';
    fs1.parentNode.insertBefore (thenewdiv,fs1);

    var islast = false
    j = j1
    while ( !islast && j < thenodes.length ) {
        var nod= thenodes[j];
        if ( !nod )
            j++
        else {
            if ( nod.id && nod.id == q2 )
                islast = true

            if ( nod.nodeName == 'FIELDSET') {
                // makes thenodes smaller
                thenewdiv.appendChild ( nod.parentNode.removeChild(nod) );  //  Move those nodes to the new div!
            }
            else
                j++

        }
    }

/* Only works if the fieldset is followed by some JS or some other element!
    for ( j = j1 ; j < j2+1; j++ ) {
        var nod= thenodes[j];
        if ( ! nod ) continue;
        if ( nod.nodeName!= "FIELDSET"  )
            continue;
        thenewdiv.appendChild ( nod.parentNode.removeChild(nod) );  //  Move those nodes to the new div!
    }
    */
}

function CogixPosition  ( question, left,top, fwidth, fheight,formidfordisambiguation ) {
    var prefix = CogixQuestionPrefix ( 'CogixPosition',question, formidfordisambiguation ) ;
    if ( ! prefix ) return;
    var pq = 'vwf'+prefix + question;
    var q = document.getElementById(pq);
    if ( !q ) {
        alert ( 'CogixPosition - cannot find question ' + question  );
        return;
    }
    q.style.position='absolute';
    q.style.top = top+'px';
    q.style.left = left+'px';

    var classnm = q.className;
    var ishtmlq = classnm && classnm.indexOf ('htmlquestionfieldset') >= 0;

    if ( fwidth )
        q.style.width = fwidth + 'px';
    else {
        if ( ! ishtmlq ) {
            q.style.width = q.clientWidth + 'px';
        }
    }

    if ( fheight )
        q.style.height = fheight + 'px';
}

function vwfCurrentFormId () {
    if ( typeof CogixShortTermPollid == 'undefined' || CogixShortTermPollid == null )
        return null;
    return "form"+CogixShortTermPollid ;
}

function CogixQuestionForm ( msg, q, formidfordisambiguation) {
    var theform;
    if ( ! formidfordisambiguation )
        formidfordisambiguation = vwfCurrentFormId(); //  See if Layout style tells us where form is
    if ( formidfordisambiguation ) {
        theform = document.getElementById ( formidfordisambiguation );
        if ( ! theform ) {
            alert ( msg +  '-- form ' + formidfordisambiguation + ' does not exist' );
            return null;
        }
    } else {
        var theforms = document.forms;
        switch ( theforms.length ) {
            case 0: return null;
            case 1: theform = theforms [0]; break;
            default:
                for ( var k = 0 ; k < theforms.length; k++ ) {
                    var xx = 'theforms[k].'+q;
                    if ( eval ( xx ) ) {
                        theform = theforms [k]; //  found the form
                        break;
                    }
                }
                if ( ! theform ) {
                    alert ( msg +  '-- cannot find a form with field ' + q );
                    return null;
                }
                ;
        }
    }
    return theform;

}

function CogixQuestionPrefix ( msgid, q, formidfordisambiguation){
    var theform = CogixQuestionForm( msgid , q, formidfordisambiguation);
    if ( ! theform ) return theform;
    var formid = theform.id ;
    if ( ! formid || 'form' != formid.substring (0,4) ) return null; //  incompatible style, this will never work
    return formid.substring (4);  //  all relevant elements have this
}

function CogixSetStyleAttributes ( elmt, styles) {
    if ( ! elmt || ! styles )
        return;
	var nus = elmt.style.cssText +  styles;
	elmt.setAttribute  ('style', nus );
    return;
/*
	var attrs = styles.split (';');
    for ( var k = 0 ; k < attrs .length ; k++ ) {
        var at = attrs[k];
        var ix = at . indexOf (':');
        if ( ! ix || ix >= at.length-1)
            continue;
        var name = at.substr(0,ix);
        var value = at.substr(ix+1);
        var ccdname = CogixGetJavascriptCSSAttribute(name);  //  camelcase
        var setter = "elmt.style." + ccdname + "='"+value+"'";
        eval ( setter );
    }
    */
}
/*
function CogixGetJavascriptCSSAttribute ( name ) {
    if ( ! name || name.length < 1 ) return name;
    if ( name.indexOf('-') < 0 ) return name; //  no hyphens, it's good

    //  For every hyphen, uppercase the next part of the word
    var cc = '';
    var cap = false;
    for ( var k = 0 ; k < name.length; k++ ) {
        var c = name.charAt(k);
        if ( c == '-' )
            cap = true;
        else {
            //noinspection UnnecessaryLocalVariableJS
            var x = ! cap ? c : name.substring (k,k+1).toUpperCase().charAt(0);
            cc += x;
            cap = false;
        }
    }
    return cc;
}
*/
//  Future improvement: use this instead of document.getElementById to allow twin forms
function vwfGetNestedElementById  (currentElement,id) {
    if ( ! currentElement || ! id )
        return null;    //  nothing to find
    if ( typeof currentElement.id != 'undefined' && currentElement.id && currentElement.id == id )
        return currentElement;  //  found it
    var children = currentElement.childNodes;
    if ( typeof children == 'undefined' || ! children || children.length < 1)
        return null;    //  not found
    for ( var k = 0 ; k < children.length; k++) {
        var child = children [k];
        if ( ! child.tagName )
            continue;
        var foundelement = vwfGetNestedElementById ( child, id );
        if ( foundelement != null )
            return foundelement ;
    }
    return null;
}

function vwfFindPos (obj) {
    var curleft = 0;
    var curtop = 0;
    if ( obj && obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return [curleft,curtop];
}

function CogixDisableAll  ( formid ) {
    //  debugger;
    if ( ! formid )
        formid = vwfCurrentFormId();
    if ( ! formid )
        return;
    var theform  = document.getElementById(formid);
    if ( ! theform )
        return ;
    var allelmts = findElementsInFieldsetOrRegion(theform);
    for ( var k = 0 ; k < allelmts.length; k++ ) {
        var elmt = allelmts[k];
        elmt.disabled = true;
    }
}

function CogixDisable  ( question, formidfordisambiguation ) {
    var prefix = CogixQuestionPrefix ( 'CogixDisable',question, formidfordisambiguation ) ;
    if ( ! prefix ) return;
    var pq = 'vwf'+prefix + question;
    var q = document.getElementById(pq);
    if ( !q ) {
        alert ( 'CogixDisable - cannot find question ' + question  );
        return;
    }
    var allelmts = findElementsInFieldsetOrRegion(q);
    for ( var k = 0 ; k < allelmts.length; k++ ) {
        var elmt = allelmts[k];
        elmt.disabled = true;
    }
}

function findElementsInFieldsetOrRegion (element) {
    var inputs = element.getElementsByTagName("INPUT");
    var selects = element.getElementsByTagName("SELECT");
    var textareas = element.getElementsByTagName("TEXTAREA");
    var all = new Array ();
    var k;
    for ( k= 0 ; k < inputs.length; k++ )
        all [ all.length ] = inputs [k];
    for ( k= 0 ; k < selects.length; k++ )
        all [ all.length ] = selects [k];
    for ( k= 0 ; k < textareas.length; k++ )
        all [ all.length ] = textareas [k];
    return all;
}

/**
 * @return {boolean}
 */
function Cogix_Is_Function (s, expr, i) {
    if ( expr &&  ( expr.length -1  <= i  || expr[i+1] !== '(' ) )
        return false
    return typeof window [s] === 'function';
}


function Cogix_Closest_Parent (elem, selector) {
    if (!elem || !selector)
        return elem
    var firstChar = selector.charAt(0);
    selector = selector.toLowerCase()

    // Get closest match
    for ( ; elem && elem !== document; elem = elem.parentNode ) {

        // If selector is a class
        if ( firstChar === '.' ) {
            if ( elem.classList.contains( selector.substr(1) ) ) {
                return elem;
            }
        }

        // If selector is an ID
        if ( firstChar === '#' ) {
            if ( elem.id === selector.substr(1) ) {
                return elem;
            }
        }

        // If selector is a data attribute
        if ( firstChar === '[' ) {
            if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
                return elem;
            }
        }

        // If selector is a tag
        if ( elem.tagName.toLowerCase() === selector ) {
            return elem;
        }

    }

    return false;

};

/* ViewsFlash 10 functions for validation, similar to Script

+ built in validations still working

+ Calculate a disaster if exists question 'name' defined before

+ 'name' bugs arise when name question appears before Doh?

-? why does calculate style select only html and calculagte2 and 3 shows all?
(in the end, we'll only show calculate.html with   calculate3)

+ calculate with checkbox is setting value to last one checked
when it is non-numeric, different from old behavior which was 1st checked
In checkdhdemo2, it was counting on this behavior
Leave it alone, and start using new functions


+ These Cogix functions defined here that use 'qname' can now be used with Calculate;
  they must put quotes around the qname

- Move this code to xustandard2 when finished testing

+ User declared functions can be used in Calculate !

+ CogixCountChecked works well in calculate...

+ A Calculate reference to a checkbox will sum the numeric values
  ( new behavior)
+  or return the last selected value if not numeric ( old behavior )

+ New option for Calculate:  /!  makes it read only with no border,
  so it's nice and clean. Could be used with layout to put it right next to text

QA:
=================== >>>>>>>>>>>>>>
*** still remaining. Can used misc questions for it.

+ Multiple CogixInvalid checks in cogixvalidate ?
+ Ok in built-in, Ok in alerts

+ CogixWhenSubmitted executes

***
Dont use these - use Validate.js for QA checklist
CogixNumber   -text -radio -checkbox -select -textarea -hidden
CogixString   +text -radio +checkbox -select -textarea -hidden
CogixAnswered +text +radio +checkbox +select +textarea +hidden
CogixSet      +text +radio +checkbox +select +textarea +hidden

+ CogixMessage and erasing it
+ CogixWarning
+ CogixAnswerColumnsSorted

+CogixValidate
  + CogixInvalid only makes sense in CogixValidate
   +inline(doesnt stop, is ignored)
   +CogixWhenSubmitted(message flashes, erased and ignored)
   +CogixValidate

- CogixAnswered       true/false, any answers at all ***
+ CogixCountChecked   number of checked total
+ CogixCountCheckedThis number checked answers in list ogixAnswersChecked
- CogixAnsweredThis   true if answered at least one of the values ***

+ CogixIsInteger
+ CogixIsNumber

+ Need AddHeader("X-XSS-Protection","0") while using the visual editor?
  Not any more if using Layout.

+ I could add
  CogixOnchange ('weight', functionname )
  which would use events mechanism used by everybody ...
  but not worth the possible complications of multiple handlers

+ New: calculate can use any function!
BMI = weight in kg / ( height in m ) ^ 2


 */


function Cogix_Exception () {
    var options =eval ('options$'+formid )
    if ( options )
        options.founderrors = false
}

function Cogix_ShowError ( qname, msg, fatal ) {
    var v = Cogix_GetValue (qname)
    if ( !v )
        return

    var theelement = v.firstelement // document.getElementById('r1--0')
    var formid = theelement.form.id
    var options =eval ('options$'+formid )
    var method = options.methodology
    var bgroup = v.isgroup
    var group  = bgroup ? v.elements : v.firstelement

    if ( fatal && options )
        options.founderrors = true

    var continuechecking = vwfDisplayMessage ( method, theelement, msg, formid, bgroup, group, !fatal ) ;
    if (continuechecking)
        return
    if ( fatal )
        throw new Cogix_Exception ()
}

function CogixMessage (msg) {

    var sm = document.getElementsByClassName('statusmsg');
    var ma = document.getElementsByClassName('cogix-msg-alert');
    var div = null
    if ( !sm || sm.length < 1 ) {
        if ( !ma || ma.length < 1 )
            return
        div = ma [0];
    } else
        div = sm [0]
    var t = div.innerHTML
    t += '<br/>'
    t += msg
    div.innerHTML = t
}

function CogixInvalid (qname, msg) {
    if ( typeof window.CogixValidating !== 'undefined' && window.CogixValidating ) {
        // Sets options.founderrors
        Cogix_ShowError(qname, msg, true)
    } else {
        alert ("CogixInvalid can only be called inside the CogixValidate() function")
    }
}

function CogixWarning (qname, msg) {
    // does not set options.founderrors
    Cogix_ShowError(qname, msg, false)
}

/**
 * @return {number}
 */
function CogixCountCheckedThis (qname) {
    var nchecked = 0
    var v = Cogix_GetValue(qname)
    if ( ! v || ! Cogix_answered (v) )
        return nchecked
    for (var i = 1; i < arguments.length; i++) {
        var a = arguments [i]
        if ( ! v.ismultiple ) {
            // noinspection EqualityComparisonWithCoercionJS
            if ( v.value == a ) // type coercion ok
                nchecked += 1
        } else {
            for ( var k = 0 ; k < v.values.length; k++ ) {
                // noinspection EqualityComparisonWithCoercionJS
                if ( v.values [k] == a ) // type coercion ok
                    nchecked += 1
            }
        }
    }
    return nchecked
}

/**
 * @return {boolean}
 */
function CogixAnsweredThis () {
    var nanw = CogixCountCheckedThis.apply(this,arguments)
    return nanw > 0
}

/**
 * @return {number}
 */
function CogixCountChecked (qname) {
    var v = Cogix_GetValue(qname)
    if ( !v || !Cogix_answered (v) )
        return 0
    if ( ! v.ismultiple )
        return 0
    return v.values.length
}

// numeric value of ("qname")   //  0 f not answered
/**
 * @return {number}
 */
function CogixNumber (qname) {
    var v = Cogix_GetValue(qname)
    if ( !v || ! Cogix_answered(v))
        return 0
    if ( isNaN (v.value) )
        return 0
    return Number(v.value)
}

// string congtent of ("qname")   // empty if not answered
/**
 * @return {string}
 */
function CogixString (qname) {
    var v = Cogix_GetValue(qname)
    if ( ! v ||  ! Cogix_answered(v))
        return ''
    if ( ! v.objtype )
        return '';
    if ( v.objtype === 'checkbox' ) {
        var ret = ''
        for ( var j = 0 ; j < v.values.length; j++  ) {
            if ( j > 0 )
                ret += ','
            ret += v.values [j]
        }
        return ret
    }
    return v.value
}

/**
 * @return {boolean}
 */
function CogixAnswered (qname) {
    var v = Cogix_GetValue(qname)
    return v ? Cogix_answered(v) : false
}

/**
 * @return {boolean}
 */
function Cogix_answered (v) {
    if ( ! v.objtype )
        return false;
    if ( ! v.ismultiple ) {
        // noinspection RedundantIfStatementJS
        if (!v.value)
            return false
        else
            return true
    } else {
        return v.values.length > 0
    }
}

// Use null to select none and empty
// Call repeatedly to set or unset checkboxes, use null to unset them all

function CogixSet (qname, value, checkboxsetorunset ) {
    if (!qname || !value)
        return
    var v = Cogix_GetValue (qname)
    if ( ! v || ! v.objtype)
        return
    var sval = typeof value === 'string' ? value : String(value)
    switch ( v.objtype) {
        case 'select-one':
        case 'text':
        case 'textarea':
        case 'hidden':
            v.elements [0].value = sval
            break
        case 'radio':
            Cogix_SetRadio (v.elements, sval)
            break
        case 'checkbox':
            Cogix_SetCheckbox (v.elements,sval, checkboxsetorunset)
            break
        default:
    }
}

function Cogix_SetRadio (radios, value) {
    for (var j = 0; j < radios.length; j++) {
        var r = radios[j]
        // noinspection UnnecessaryLocalVariableJS,EqualityComparisonWithCoercionJS
        var checked = radios[j].value == value // type coercion ok
        r.checked = checked
    }
}

function Cogix_SetCheckbox (checkboxes, value, setcheck) {
    for (var j = 0; j < checkboxes.length; j++) {
        var r = checkboxes[j]
        if ( !value) {
            r.checked = false
            continue;
        }
        var set = typeof setcheck == 'undefined' ? true : setcheck
        // noinspection EqualityComparisonWithCoercionJS
        var thebox = checkboxes[j].value == value // coercion ok
        if ( thebox ) {
            r.checked = set
            break
        }
        // Unset all the checkboxes to unset them all
    }
}

// returns radio, checkbox, select, hidden, literal-html, m
/**
 * @return {null}
 */
function Cogix_GetValue(qname) {
    if ( typeof qname !== 'string' ) {
        if (arguments.callee.caller.name)
            alert ( arguments.callee.caller.name + ' requires the name of a question in quotes ')
        return null
    }
    var els = document.getElementsByName(qname) // []
    if (!els || els.length < 1)
    {
        // noinspection JSConstructorReturnsPrimitive
        return null
    } // will be null for a div or fieldset
    // prune <anchor tags from elements
    var els2 = []
    for ( var i = 0 ; i < els.length; i++ ) {
        if (els[i].tagName === 'A' )
            continue
        els2.push (els[i])
    }
    if ( els2.length < 1 )
    { // noinspection JSConstructorReturnsPrimitive
        return null
    }
    // noinspection JSValidateTypes
    els = els2
    var ret = {
        elements: els,
        name: qname,
        objtype: null,
        value: null,
        values: null,
        ismultiple: false,
        isgroup: false,
        firstelement:els[0]
    }
    var obj = els[0]
    ret.objtype = obj.type // will be null for a fieldset or div
    ret.value = obj.value // could be null
    if (!ret.objtype)
        return ret;
    if (vwfistypeText(ret.objtype)) {
        ret.objtype = 'text'
    } else if (ret.objtype === 'checkbox') {
        ret.isgroup = true
        ret.ismultiple = true
        ret.value = 0
        ret.values = []
        for (var j = 0; j < els.length; j++) {
            if ( j === 0 )
                ret.firstelement = els [j]
            if (els [j].checked) {
                // store checked values in values using push; count is values.length
                var v = els [j].value
                if  (v) {
                    ret.values.push(v)
                    // recalc value = sum of checked values
                    if (Cogix_IsInteger(v))
                        ret.value += Number(v)
                    else {
                        if (els.length === 1)
                            ret.value = v
                    }
                }
            }
        }
    } else if (ret.objtype === 'radio') {
        // value is what is selected, not value of 1st element!
        ret.isgroup = true
        ret.value = null
        for (var k = 0; k < els.length; k++) {
            if ( k === 0 )
                ret.firstelement = els [k]
            if (els [k].checked) {
                ret.value = els [k].value
                break
            }
        }
    }
    return ret
}

function Cogix_References (x) {
    CogixNumber('')
    CogixIsInteger('',false)
    CogixIsNumber('')
    CogixString('')
    CogixInvalid('','')
    CogixWarning('','')
    CogixMessage('')
    CogixAnswered('')
    CogixAnsweredThis('qname',0,1,2)
    CogixCountChecked('')
    CogixCountCheckedThis('','')
    CogixSet('','',false)
}

/**
 * @return {boolean}
 */
function CogixIsInteger(qname,negativeok) {
    var v = Cogix_GetValue(qname)
    return v ? Cogix_IsInteger(v.value,negativeok) : false
}

/**
 * @return {boolean}
 */
function CogixIsNumber(qname) {
    var v = Cogix_GetValue(qname)
    return v ? Cogix_IsNumber(v.value) : false
}

/**
 * @return {boolean}
 */
function Cogix_IsInteger(value,negativeok) {
    if ( ! value || isNaN(value)) {
        return false
    }

    var x = parseFloat(value);
    var t1 = ( x | 0 ) === x
    if ( !t1 )
        return false

	if ( value.indexOf(' ') >= 0 )
		return false

    var nok = typeof negativeok !== 'undefined' && negativeok
	if ( ! nok && value.indexOf('-') >= 0 )
		return false;
    return value.indexOf('.') < 0;
}

/**
 * @return {boolean}
 */
function Cogix_IsNumber(value) {
    if ( ! value || isNaN(value)) {
        // noinspection JSConstructorReturnsPrimitive
        return false
    }
    return ! isNaN(value - parseFloat(value))
}


