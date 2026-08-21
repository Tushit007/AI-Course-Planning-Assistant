import { supabase } from "../supabase";


// =====================================================
// GET /api/courses/:id
// =====================================================

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json(
        { error: "Course ID is required." },
        { status: 400 }
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "Supabase GET course error:",
        error
      );

      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        { error: "Course not found." },
        { status: 404 }
      );
    }

    return Response.json({
      course: data,
    });

  } catch (error) {
    console.error(
      "GET course error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch course.",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// PUT /api/courses/:id
//
// If course exists → UPDATE
// If course doesn't exist → INSERT
// =====================================================

export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json(
        { error: "Course ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      title,
      subject,
      course_metadata,
      target_audience,
      duration_and_frequency,
      learning_goals,
      modules,
      refine_log,
      status,
    } = body;


    const courseData = {
      id,

      title:
        title || "Untitled Course",

      subject:
        subject || "",

      course_metadata:
        course_metadata || {},

      target_audience:
        target_audience || "",

      duration_and_frequency:
        duration_and_frequency || "",

      learning_goals:
        learning_goals || "",

      modules:
        Array.isArray(modules)
          ? modules
          : [],

      refine_log:
        Array.isArray(refine_log)
          ? refine_log
          : [],

      status:
        status || "draft",

      updated_at:
        new Date().toISOString(),
    };


    // -------------------------------------------------
    // Check whether this course already exists
    // -------------------------------------------------

    const {
      data: existing,
      error: findError,
    } = await supabase
      .from("courses")
      .select("id")
      .eq("id", id)
      .maybeSingle();


    if (findError) {
      console.error(
        "Supabase find course error:",
        findError
      );

      return Response.json(
        {
          error: findError.message,
        },
        { status: 500 }
      );
    }


    // =================================================
    // CREATE
    // =================================================

    if (!existing) {

      const {
        data,
        error,
      } = await supabase
        .from("courses")
        .insert(courseData)
        .select()
        .single();


      if (error) {
        console.error(
          "Supabase INSERT course error:",
          error
        );

        return Response.json(
          {
            error: error.message,
          },
          { status: 500 }
        );
      }


      console.log(
        "✅ Course created:",
        data.id
      );


      return Response.json(
        {
          course: data,
        },
        { status: 201 }
      );
    }


    // =================================================
    // UPDATE
    // =================================================

    const {
      data,
      error,
    } = await supabase
      .from("courses")
      .update(courseData)
      .eq("id", id)
      .select()
      .single();


    if (error) {
      console.error(
        "Supabase UPDATE course error:",
        error
      );

      return Response.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }


    console.log(
      "✅ Course updated:",
      data.id
    );


    return Response.json({
      course: data,
    });

  } catch (error) {

    console.error(
      "PUT /api/courses/[id] error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save course.",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// DELETE /api/courses/:id
// =====================================================

export async function DELETE(
  request,
  { params }
) {
  try {

    const { id } = params;

    if (!id) {
      return Response.json(
        {
          error:
            "Course ID is required.",
        },
        { status: 400 }
      );
    }


    const {
      error,
    } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);


    if (error) {

      console.error(
        "Supabase DELETE course error:",
        error
      );

      return Response.json(
        {
          error:
            error.message,
        },
        { status: 500 }
      );
    }


    console.log(
      "✅ Course deleted:",
      id
    );


    return Response.json({
      success: true,
      id,
    });

  } catch (error) {

    console.error(
      "DELETE course error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete course.",
      },
      { status: 500 }
    );
  }
}