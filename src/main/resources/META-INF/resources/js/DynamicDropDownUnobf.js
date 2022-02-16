function DynamicDropDown () {
    //  DynamicDropDown ( formname, dropdownname, "selectedvalue", "value|text","value|text","value|text"... )

    var args = DynamicDropDown.arguments;
    var nargs = args.length;
    if ( nargs < 3 )
        return;
    var formname = args [0];
    var theform = document.forms [ formname ];
    var thedropdownname = args [1];
    var thedropdownelement = theform.elements [thedropdownname];
    if (  ! thedropdownelement ) {
        alert ( "DynamicDropDown - question '" + thedropdownname + "' not found.  Perhaps it needs to be moved above this DropDownQuestion" );
        return;
    }
    if ( "select-one" != thedropdownelement.type ) {
        alert ( "DynamicDropDown - question '" + thedropdownname + "' is not a select-one element" );
        return;
    }
    var currvalue = args [2];

    //  if no choices, add a "choose" ; if one or more choices, leave them alone. It is ok to prepopulate.
    var options = thedropdownelement.options;
    if ( options.length < 1 ) {
        options [ options.length ] = new  Option ( " Choose " );
    }
    var separator ='?'; //  Ascii 127
    for ( var k = 3;  k < args.length; k++ ) {
        var op = args [k] ;
        if ( op && op.length > 0 ) {
            var isep  = op.indexOf (separator);
            if ( isep > 0 ) {
                //??    Need to guard against empty values in both
                var value = op.substring (0,isep);
                var text = op.substring (isep+1);
                options [ options.length ] = new Option ( text, value, false, false );
                continue;
            }
            //  Value only
            options [ options.length ] = new Option (  op, op, false, false );
        }
    }

    var selectedix = -1;
    for ( var j = 0;  currvalue != "" && j < options.length; j++ ) {
        if ( currvalue == options [j].value ) {
            selectedix = j;
        }
    }

    if ( selectedix >= 0 ) {
        thedropdownelement.selectedIndex = selectedix;
         thedropdownelement[selectedIndex].selected = true;
    }

}
