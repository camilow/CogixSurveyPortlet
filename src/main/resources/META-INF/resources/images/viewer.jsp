<%@page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.sql.*" %>
<%@ page import="com.cogix.vwf.*" %>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">

<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>View Tables</title>
    <style>
        body, td, p { font-family:Arial,serif; font-size:10pt; vertical-align: top;}
    </style>
</head>
<body>
<%
    int nrec = 0;
    String where = request.getParameter ("where");
    if ( where == null )
        where = "";

%>
<b><%=where%> </b>

<table border="1" cellpadding="3" cellspacing="0">
    <%
        if ( "go".equals ( request.getParameter ("go") ) ) {
//            String colsep =   "&nbsp;&nbsp;</td><td>";
            String rowstart = "<tr>";
            String colstart = "<td>";
            String colend = "</td>";
            String rowend = "</tr>";
            out.print ( rowstart );

            dbStore dbs = Dirs.getdbStore ();
            Connection con = null;
            Statement stmt = null;
            ResultSet rs = null;
            PreparedStatement pstmt = null;
            try {
                con = dbs.getConnection ();
                String query = where;
                //  System.out.println ( query);
/*
                //  Use with a table created with create table junk ( x varchar2(40)); It will insert a Japanese specialty name
                if ( "junk".equals (query)) {
                    String myvalue = "般外科系";
                    out.print ( myvalue);
                    pstmt = con.prepareStatement ("insert into " + table+ " ( x ) values (?)" );
                    pstmt.setString ( 1, myvalue );
                    pstmt.execute ();
                }
*/
                stmt = con.createStatement ();
                rs = stmt.executeQuery (query);
                int ncols = rs.getMetaData ().getColumnCount ();
                for ( int icol = 0 ; icol < ncols-1; icol ++ ) {
                    String colname = rs.getMetaData ().getColumnName (icol+1);
                    out.print ( colstart);
                    out.print (colname );
                    out.print ( colend);
                }
                out.print ( rowend);
                while ( rs.next () ) {
                    out.print ( rowstart );
                    for ( int icol = 0 ; icol < ncols-1; icol ++ ) {
                        String value = rs.getString (icol+1);
                        out.print ( colstart);
                        out.print ( value );
                        out.print ( colend);
                    }
                    out.print ( rowend);
                    nrec ++;
                }
            } catch ( SQLException e ) {
                out.print ( e );
            } finally {
                dbs.close ( pstmt );
                dbs.close ( rs );
                dbs.close ( stmt );
                dbs.freeConnection ( con );
            }

        }

    %>



</table>
<br><%=nrec%> records<br><br>
<form action="" method="post">

    Query:    <input type="text" size="160" name="where" value="<%=where%>" /><br>
    <input type="hidden" name="go" value="go"/>
    <input type="submit" value="Submit" />
</form>
</body>
</html>