import { supabase } from "./supabase";


// GET /api/courses
// Fetch all saved courses
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Supabase GET courses error:",
        error
      );

      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      courses: data || [],
    });

  } catch (error) {
    console.error(
      "GET /api/courses error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch courses.",
      },
      {
        status: 500,
      }
    );
  }
}


// POST /api/courses
// Create a new course
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      id,
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


    // -----------------------------
    // Validation
    // -----------------------------

    if (!title) {
      return Response.json(
        {
          error: "Course title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!subject) {
      return Response.json(
        {
          error: "Course subject is required.",
        },
        {
          status: 400,
        }
      );
    }


    // -----------------------------
    // Database record
    // -----------------------------

    const course = {
      ...(id ? { id } : {}),

      title,

      subject,

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


    // -----------------------------
    // Insert
    // -----------------------------

    const { data, error } = await supabase
      .from("courses")
      .insert(course)
      .select()
      .single();


    if (error) {
      console.error(
        "Supabase POST course error:",
        error
      );

      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }


    return Response.json(
      {
        course: data,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "POST /api/courses error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save course.",
      },
      {
        status: 500,
      }
    );
  }
}