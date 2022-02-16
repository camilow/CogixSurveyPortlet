//  Javascript to be used with Standard_ and compatible styles
//  (c) 2006-2018 Cogix Corporation
//  May only be used as a component of a licensed Cogix product
//  Updated Nov 30 2007 to be lenient with ending semicolons and to alert on bad values rather than quitting silently, and also to make . the default decimal places character
//  Updated April 2010 to trigger Display Or Hide change handlers, (eg hidden questions)
//var CalculatorArray_vwf; moved to Standard style
//var Calculate_defaultformat_vwf; moved to Standard style

var Calculate_copyright="Copyright (c) 2006-2011 Cogix Corporation - may only be used as part of licensed Cogix software. Decompilation prohibited.";
var CogixModuleIdentifier = "UCalculate3_.js";

//  Used by Calculate2 question style
function Calcvwf_SetupCalculate ( theform, specquestion ) {
    if (  typeof window.Calculate_defaultformat_vwf == 'undefined' )
        window.Calculate_defaultformat_vwf = "";
    if (  typeof window.CalculatorArray_vwf == 'undefined' )
        window.CalculatorArray_vwf = new Array ();
    if ( typeof window.vwfEventsListObject  == 'undefined' )
        window.vwfEventsListObject = new vwfEventsList ();

    var missingquestions = "";
    var theq = theform.elements[specquestion];
    var formulii = theq.value;

    var formulas = formulii.split(/[;\n]/);
    for ( var ff = 0; ff < formulas.length; ff ++ ) {
        var formula = formulas[ff].replace(/[\r\n]/,'') ;
        formula = Calcvwf_trim  ( formula );
        if (formula != "" ) {
            if ( formula.length >= 1 && formula.charAt(0) == '#'  ) //  # comment
                continue;
            if ( formula.length >= 2 && formula.charAt(0) == '/' && formula.charAt(1) == '/' ) //   // comment
                continue;

            var rematch = formula.match(/([^\=]*)\=(.*)/); // split around =
            if ( rematch == null || rematch.length === 1 ) {
                bErrors = true;
                alert ("Calculate - Missing = on this line:\n" + formula + '');
                break;
            }
            else if ( rematch != null && rematch.length > 2 ) {
                var parts = [ rematch[1].trim(), rematch[2] ];
                if ( new String("calculate-default") == ( new String(parts[0])).toLowerCase() ) {
                    window.Calculate_defaultformat_vwf =  parts [1]  ;
                    continue;
                }
                var bErrors = false;
                var checklhs = parts [0] .split("/");
                var checktgt = checklhs != null && checklhs.length > 1 ? checklhs [0] : parts [0];
                var tgtcomponent = eval ("theform." + checktgt ) ;
                if ( tgtcomponent == null ) {
                    missingquestions += checktgt + " ";
                    bErrors = true;
                }
                var tgttype = tgtcomponent.type
                if ( ! tgttype || ( tgttype!='text' && tgttype!='hidden' ) ) {
                    bErrors = true
                    alert ( 'Calculate - target question "' +checktgt+
                        '" is not a text question or a hidden question.' )
                }

                var expr = Calcvwf_splitter ( parts[1])  ;    //  Array of symbols and operands
                for (var i = 0; i < expr.length; i ++ ) {
                    var s  =  expr [i] ;
                    if ( ! Calcvwf_IsCalculationOperator(s) && isNaN(s) ) {
                    //if ( ! Calcvwf_IsCalculationOperator(s) && ! Calcvwf_IsStringLiteral(s) && isNaN(s) ) {
                        //  If not an operator and not a string or numeric constant
                        //  either a function or a question
                        if ( Cogix_Is_Function (s,expr,i) )
                            continue
                        if ( Calcvwf_IsStringLiteral(s) ) {
                            // remove quotes and single quotes from s
                            s = Cwlcvwf_RemoveStringDelimiters (s)
                            if ( ! theform.elements[s] )
                                continue    // a literal, not a qname in quotes
                        }
                        // TBD will fail with 'name' - or perhaps not ?
                        var thecomponent = eval ( "theform."+s) ;
                        if ( thecomponent != null ) {
                            // 70 new way to do it
                            window.vwfEventsListObject.addEvent ( 2, Calcvwf_EventName ( theform.getAttribute('name') ,s) ,
                            // window.vwfEventsListObject.addEvent ( 2, Calcvwf_EventName ( theform.name ,s) ,
                                Calcvwf_ChangeHandler );

                            // if a radio button, put the handler on each one
                            if ( thecomponent.type == null && thecomponent.length != null ) {
                                for ( var k = 0 ; k < thecomponent.length; k ++ ) {
                                    var thecompt = thecomponent[k];
                                    thecompt.onclick = vwfGetUpdatedHandler ( thecompt, thecompt.onclick );
                                }
                            }
                            else {
                                thecomponent.onchange = vwfGetUpdatedHandler ( thecomponent, thecomponent.onchange );
                                if ( thecomponent.type && 'select-one' == thecomponent.type  && Calcvwf_IsFirefox () )
                                    thecomponent.onkeyup =vwfGetUpdatedHandler ( thecomponent, thecomponent.onkeyup );
                            }
                        }
                        else {
                            missingquestions  += s + " " ;
                            bErrors = true;
                        }
                    }
                }
                if ( ! bErrors ) {
                    window.CalculatorArray_vwf [ window.CalculatorArray_vwf . length] =  parts[0] + "=" +  parts [1]  ;
                    // This is where one would put stuff in to do Calculates at the start of the page. It has huge complications
                    //  We end up in Calcvwf_EvaluateFormula which triggers DoH handlers as well as handlers for DOHs that
                    //  might use it, and is related to which field has changed, which this does not do...
                    //  So just calling that method would not work and it needs to be a hairy variant.

                    //  So, defer. ***** Easy enough to back it out, however:

                    Calcvwf_EvaluateFormula (parts[0],parts[1],null,theform);
                }
            }
        }
    }
    if ( "" != missingquestions ) {
        alert ("Calculate expression refers to undefined (probably misspelled) questions: " + missingquestions + "" );
    }
}

function Calcvwf_IsFirefox () {
    return navigator.userAgent.indexOf ("Firefox" ) >= 0 ;
}


//  70 Event handling
function Calcvwf_ChangeHandler (elmt) {
    Calcvwf_Recalculate ( elmt.name,  window.CalculatorArray_vwf, elmt.form );
}

//  Event handler for all operands
function Calcvwf_OnChange () {
    Calcvwf_Recalculate ( this.name,  window.CalculatorArray_vwf, this.form );
}

function Calcvwf_Recalculate (name, CalculatorArray_dyn, theform) {

    // find formulas with 'name' as an operand. Could this fail when we have similar names,  eg   total and atotala ?
    for (var f=0; f < CalculatorArray_dyn.length; f++) {
        if ( CalculatorArray_dyn[f].indexOf(name) >= 0 ) {
            var formula = CalculatorArray_dyn[f] ;
            //var parts = formula.split("=");
            //if ( parts.length > 1 ) {
            var rematch = formula.match(/([^\=]*)\=(.*)/);
            if ( rematch != null && rematch.length > 2 ) {
                // TBD extra check to see that it's the entire name,
                // eg food and foodcoloring looking for food
                var parts = [ rematch[1], rematch[2] ];
                if ( parts[1].indexOf(name) >= 0 && parts[0] != "" ) {
                    Calcvwf_EvaluateFormula (parts[0],parts[1],name,theform);
                }
            }
        }

    }
}

function Calcvwf_EvaluateFormula (target,formula,id, theform) {
    //  semantics:  questionname.2.$ means format to two decimal places, and group using commas. $ is totally misleading.
    //  revised semantics:
    //      questionname = no dollar, no separators, no decimals:  1234
    //      questionname/$.2 = dollar, separate with commas, two decimals (US notation)   $1,234.00
    //      questionname/?,0 = euro, separate with periods, no decimals (European notation)  ?1.000

    //  How to parse: everything before the . or , is the currency symbol, if one will be used
    //  The , or . if present, indicate the decimals separator; the other separator is used for grouping
    //  The digit is the number of decimal places
    //  A negative sign always precedes the answer automatically


    var binitializing = id == null; //  Used at initialization time to trigger initial recalc
    var decimals = 0;
    var currency = "";
    var decimalseparator = "";
    var thousandsseparator = "";
    var format = window.Calculate_defaultformat_vwf;
    var target_parts = target.split("/");
    if ( target_parts.length > 1 ) {
        target = target_parts[0];
        format = target_parts [1];
    }
    if ( ! format )
        format = "";
    var settarget = eval ( "theform."+target  ) ;
    if ( settarget == null )
        return; //  target is not in this form

    //  Parse format
    var bEnable = false;
    var bShow = false;
    if ( format.length > 0 ) {
        format = format.replace(/^\s+|\s+$/); // trim

        var icomma = format.indexOf('.');
        var iperiod = format.indexOf(',');
        var iseparator = Math.max ( icomma, iperiod ) ;

        var bDonotDisable = format.charAt ( format.length -1 ) == '~';
        if ( bDonotDisable ) {
            format = format.substring ( 0, format.length-1);
            bEnable = true;
        }
        var bShowDiabled = format.charAt ( format.length -1 ) == '!';
        if ( bShowDiabled ) {
            format = format.substring ( 0, format.length-1);
            bShow = true;
        }


        if ( format.length >= 1 ) {
            var digit = format.charAt ( format.length -1 );
            var hasdecimalsdigit = digit >= '0' && digit <= '9' ;
            if ( hasdecimalsdigit ) {   //  digits is always last
                decimals = digit;
            }
            if ( iseparator < 0 ) {  //  no comma or period
                if ( hasdecimalsdigit ) {
                    if ( format.length >= 1 ) {
                        currency = format.substring ( 0, format.length -1 ) ;
                    }
                }
                else {  //  format: qname/Currency
                    currency = format;
                }
            }
            else {  //  decimal separator used
                decimalseparator = format.substring ( iseparator,iseparator+1) ;
                if ( iseparator > 0 ) { //  currency symbol used
                    currency = format.substring ( 0, iseparator );
                }
            }
        }
    }
    if ( bShow ) {
        settarget.style.border = 'none'
        settarget.readOnly = true;
        settarget.tabIndex=-1
    }
    else if ( ! bEnable ) {
        settarget.style.background = "#DDDDDD";
        settarget.readOnly = true;
        settarget.tabIndex=-1
    }
    if ( decimalseparator == "." )
        thousandsseparator = ",";
    if ( decimalseparator == "," )
        thousandsseparator = ".";


    var expr = Calcvwf_splitter (formula);

    var bEvalOk = binitializing;
    var evalexpr = "";
    for (var i = 0; i < expr.length; i++) {
        if ( Cwlcvwf_RemoveStringDelimiters( expr[i] ) === id )
            bEvalOk = true;
        if (Calcvwf_IsCalculationOperator(expr [i])) {     // operators and parens
            evalexpr = evalexpr + expr[i];
        } else {        // constants
            if (!isNaN(expr[i]) || Calcvwf_IsStringLiteral(expr[i])) {
                evalexpr = evalexpr + expr[i];
            } else // functions
                if ( Cogix_Is_Function (expr[i], expr, i) ) {
                evalexpr = evalexpr + expr[i];
            } else {    // question names are unique only within forms, so can't use document.getElementById
                var theObj = eval("theform." + expr [i]);
                var objvalue = null;
                if (theObj != null) {
                    if (theObj.type) {
                        //hidden,input,textarea,select, single valued checkbox
                        if (theObj.type == 'checkbox') {
                            if (theObj.checked)
                                objvalue = theObj.value;
                        } else
                            objvalue = theObj.value;
                    } else {
                        if (theObj.length > 0) {
                            var objtyp = theObj[0].type
                            if (objtyp == 'radio')
                                objvalue = theObj.value
                            if (objtyp == 'checkbox') {
                                var sumofvalues = 0;
                                var bnonnumeric = false
                                for (var k = 0; k < theObj.length; k++) {
                                    if (theObj[k].checked) {
                                        var chnum = Number(theObj[k].value)
                                        if (!isNaN(chnum))
                                            sumofvalues += chnum;
                                        else {
                                            bnonnumeric = true;
                                            objvalue = theObj[k].value
                                        }
                                    }
                                }
                                if ( ! bnonnumeric)
                                    objvalue = '' + sumofvalues;
                                else
                                    if (!objvalue)
                                        objvalue = ''
                            }
                        }
                    }

                    if (objvalue != null) {
                        var fvalue = Calcvwf_ParseFloat(objvalue, decimalseparator, thousandsseparator);
                        if (!isNaN(fvalue)) {
                            if (fvalue != 0) {
                                if (fvalue < 0) {
                                    evalexpr += "(" + fvalue + ")";
                                } else {
                                    evalexpr += fvalue;
                                }
                            } else {
                                if (i > 0 && expr [i - 1] == "/")
                                    bEvalOk = false;
                                else
                                    evalexpr += "0";
                            }
                        } else {
                            //bEvalOk = false;    //  NaN
                            evalexpr += '\'' + fvalue.replace('\'', '\\\'') + '\'';
                        }
                    } else {
                        if (i > 0 && expr [i - 1] == "/")
                            bEvalOk = false;
                        else
                            evalexpr += "0";
                    }
                }
            }
        }
    }

    if ( bEvalOk ) {
        var targetvalue = eval(evalexpr);
        var calcvalue = Calcvwf_Format ( targetvalue, decimals, thousandsseparator, decimalseparator, currency );
        if ( isNaN (targetvalue) )
            calcvalue = '';
        settarget.value = calcvalue;
        if ( binitializing )
            return;
        //  Notify of change in target
        Calcvwf_Recalculate ( settarget.name, window.CalculatorArray_vwf, theform );

        // Triggers display or hide handlers
        if ( settarget.onchange ) {
            settarget.onchange ();
        }
    }
}

//  (float, int, string, string, string )
function Calcvwf_Format (amount, ndecimalplaces, thousandsseparator, decimalseparator, currencysymbol ) {
    //  First two arguments must be not empty
    //  -1234567.33333333333333
    if ( isNaN(amount) )
        return amount;
    var minus = amount >= 0 ?  '' : "-";
    amount = Math.abs (amount); //  1234567.33333333333333





    var intpart = Math.floor(amount);   //  1234567
    var intstring = "" +  intpart ;
    intstring = Calcvwf_Thousands ( intstring, thousandsseparator);
    var response = minus + currencysymbol + intstring ;

    if ( ndecimalplaces == 0 ) {
        return response;
    }

    //  amount,ndecimalplaces,
    var formatted = "" + amount.toFixed(ndecimalplaces);
    var ixperiod = formatted.indexOf('.');
    if ( ixperiod >=0 ) {
        var intsep = Calcvwf_Thousands(formatted.substring(0,ixperiod),thousandsseparator);
        var decpart = formatted.substring(ixperiod+1);
        response = minus + currencysymbol + intsep + decimalseparator + decpart;
        //response += decimalseparator + formatted.substring(ixperiod+1);
    }
    return response;
}

function Calcvwf_Thousands ( s, separator ) {
    if ( s.length < 3 || separator == null || separator.length < 1 )
        return s;
    var ret = "";
    while ( s.length > 0 ) {
        var lchunk = s.length >= 3 ? 3 : s.length ;
        var chunk = s.substring ( s.length - lchunk , s.length );   //  567     234             1
        s = s.substring ( 0, s.length - lchunk );                           //  1234    1                 ""
        ret = ( s.length > 0 ? separator : "" ) + chunk + ret;      //  ,567    ,234,567    1,234,567
    }
    return ret;
}

function Calcvwf_trim (trimstr) {
    return trimstr.replace(/^\s+/,'').replace(/\s+$/,'');
// ordinary trim, not removal of all spaces...
    if ( ! trimstr )
        return '';
    if (Calcvwf_IsStringLiteral(trimstr)) return trimstr;
    var trimmed = "";
    for (var i = 0; i < trimstr.length; i ++) {
        if (trimstr.charAt(i) != " ")
            trimmed = trimmed + trimstr.charAt(i);
    }
    return trimmed;
}

function Calcvwf_removeCommas (theString) {
    theString = theString.replace(/\,/g,"");
    return theString;
}

function Calcvwf_splitter (newexpr) {
    // added ! unary operator and '' and "" empty strings
    return newexpr.match(/[\w\.]+|".*?[^\\]"|\'\'|\"\"|'.*?[^\\]'|===|==|>=|<=|!=|&&|\|\||[\+\-\*\/\(\)\,\?\:\!\>\<]/g);
    // Richard's original: return newexpr.match(/[\w\.]+|".*?[^\\]"|'.*?[^\\]'|[\+\-\*\/\(\)\,\?\:\>\<]|==|>=|<=|!=|&&|\|\|/g);
}


function Calcvwf_IsCalculationOperator ( s ) {
    if (s == null || s == "")
        return false;
    return s == "+" || s == "-" || s == "*" || s == "/" || s == "**" || s == "%" || s == "++" || s == "--"
        || s == "/" || s == "(" || s == ")" || s == ","
        || s == ":" || s == "?" || s == "==" || s == ">=" || s == "<=" || s == "!=" || s == ">"|| s == "<"
        || s == "&&" || s == "===" || s == "!==" ||s == "!" ||s == "||"
        || s == "&" || s == "|" || s == "~" ||s == "^" ||s == "<<" ||s == ">>" ||s == ">>>"
        || s.substr(0, 5).toLowerCase() == "math.";
}

function Calcvwf_IsStringLiteral(s) {
    return s.match(/^([\'\"]).*\1$/) != null;
}

/**
 * @return {string}
 */
function Cwlcvwf_RemoveStringDelimiters (s) {
    if ( !s || s.length < 3 )
        return s
    var ch0 = s.charAt(0)
    var ch1 = s.charAt (s.length - 1)
    if ( ch0 === '\'' && ch1 === '\'' )
        return s.substring(1,s.length - 1 )
    else if ( ch0 === '\"' && ch1 === '\"' )
        return s.substring(1,s.length - 1 )
    else
        return s
}

//  Returns calculatable number
function Calcvwf_ParseFloat ( s,  decimalseparator, thousandseparator ) {
    s = Calcvwf_trim (s);
    if (isNaN(s)) return s;
    if ( s.length < 1 )
        return s;
    var bNeg = false;
    if ( s.charAt(0) == '-' ) {
        bNeg = true;
        if ( s.length == 1 )
            return 0.0;
        s = s.substring (1);
    }
    //  [$][NNN][.][,][NN]
    var number ='';
    var currency = '';
    var bFoundSeparator = false;
    var bFoundNumber = false;
    for ( var k = 0;  k < s.length; k++ ) {
        var ch = s.charAt(k);
        if ( ch >= '0' && ch <= '9' ) {
            //  Have found the start of the number
            number += ch;
            bFoundNumber  = true;
        }
        else if ( ch == decimalseparator ) {
            number += ".";
            bFoundSeparator = true;
        }
        else if ( ch == thousandseparator ) {
            bFoundSeparator = true;
        }
        else {
            if  ( ! bFoundSeparator && ! bFoundNumber )
            //  currency sign
                currency += ch;
            else {
                //  Invalid character in the middle of the number
                // special case: no decimal separator and no thousands separator, and there is only one comma or period, treat is a decimal
                if ( decimalseparator == "" && thousandseparator == "" ) {
                    var nperiods = Calcvwf_CountSeparators (s,'.');
                    var ncommas = Calcvwf_CountSeparators (s,',');
                    if ( nperiods + ncommas == 1 ) {
                        bFoundSeparator = true;
                        number += ".";
                        continue;
                    }
                }
                alert ( "Calculate found illegal character '" + ch + "' in this  number: '" + s +"'"  );
                return parseFloat ('DynamicGrid');   //  returns NaN
            }
        }
    }
    if ( !bFoundNumber)
        return 0.0;
    var fnumber = parseFloat (number);
    return bNeg ? - fnumber : fnumber ;

}

function Calcvwf_CountSeparators ( s, ch ) {
    if ( !s || s.length < 1 )
        return 0;
    var parts = s.split (ch);
    return parts.length - 1;
}

function Calcvwf_EventName ( formname, elementname) {
    return formname + '!' + elementname ;
}
