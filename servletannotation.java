/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.cogix.vwf;

import org.osgi.service.component.annotations.Component;

import javax.servlet.Servlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
/** Original:
 * This servlet has been created to serve static resources from
 * vaadin-client-compiled.jar and vaadin-themes.jar
 *
 * @author Sampsa Sohlman
@Component(immediate = true, property = {
        "osgi.http.whiteboard.servlet.name=Vaadin Resources Servlet",
        "osgi.http.whiteboard.servlet.pattern=/VF/sevlet/viewsflash/*",
        "service.ranking:Integer=100" }, service = { Servlet.class })

public class VaadinOsgiServlet extends HttpServlet
        implements
        Servlet {

@Override
public void init(ServletConfig config) throws ServletException {
    super.init ( config );
    System.out.print("vaddin init" + config);
}


    public VaadinOsgiServlet() {
System.out.print("vaddin consrtructor");
    }


    @Override
    protected void service(HttpServletRequest request,
                           HttpServletResponse response) throws IOException {

        String requestURI = request.getRequestURI();
        PrintWriter wr = response.getWriter ();
        wr.print ("vaddin " + request + "?" +  request.getQueryString () );
        // com.sun.image.codec.jpeg.ImageFormatException fes = new  com.sun.image.codec.jpeg.ImageFormatException();
    }

    // osgi.http.whiteboard.context.name:  HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_NAME;

 */

}