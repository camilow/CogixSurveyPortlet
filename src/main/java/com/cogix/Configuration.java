package com.cogix;

import aQute.bnd.annotation.metatype.Meta;

@Meta.OCD(id = "com.cogix.Configuration")
public interface Configuration {

    @Meta.AD(required = false, deflt="Examples")
    public String spotname ();

    @Meta.AD(required = false, deflt="car_purchase")
    public String pollname ();

    @Meta.AD(required = false, deflt="")
    public String pollmsg ();

    @Meta.AD(required = false, deflt="link")
    public String pollembedorlink ();

    @Meta.AD(required = false, deflt="checked")
    public String pollresultsaftercompleting ();

    @Meta.AD(required = false, deflt="checked")
    public String pollresultslink ();

    @Meta.AD(required = false, deflt="unchecked")
    public String uselocale ();

}

