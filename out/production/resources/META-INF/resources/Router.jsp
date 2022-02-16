<%
    //  Router.jsp - used in portals to add userid to ViewsFlash application requests
    //  Does nothing outside of portals
    String viewsflash = request.getParameter("vwf-servlet");
    if (viewsflash == null)
        viewsflash = "/viewsflash";
    else {
        int islash = viewsflash.lastIndexOf ( '/' ) ;
        if ( islash >= 0 )
            viewsflash = viewsflash.substring(islash) ;
        else
            viewsflash = "/" + viewsflash;
    }
    ServletContext ctx = pageContext.getServletContext();
    String servlet = "/servlet" + viewsflash;

    RequestDispatcher rd = ctx.getRequestDispatcher(servlet);
    if ( rd == null ) {
        out.print ("could not find request dispatcher ");
        return;
    }
    String UserIdSessionAttribute = "com.cogix.vwf.UserIdSessionAttribute ";   //  From SurveyPortlet.java
    String userid = (String) request.getSession(true).getAttribute (UserIdSessionAttribute);
    String VIEWSFLASHREQUESTNOTIFIERID = "com.cogix.vwf.RequestNotifierId";
    if ( userid != null )
        request.setAttribute  (VIEWSFLASHREQUESTNOTIFIERID, userid );
    String ndc = request.getParameter ( "nodupecheck" );
    if ( ndc != null )
        request.setAttribute("nodupecheck",ndc);
    rd.include(request, response);
%>
