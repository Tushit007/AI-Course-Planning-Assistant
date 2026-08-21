// Course Planning Studio
// Database-backed storage.
//
// The UI still uses the same storage.get/set/delete/list API,
// but the data is now stored in Supabase PostgreSQL through
// the Next.js API routes.
//
// Flow:
//
// page.jsx
//    ↓
// lib/storage.js
//    ↓
// /api/courses
//    ↓
// Supabase PostgreSQL


// ---------------------------------------------------------
// Helper: make an API request
// ---------------------------------------------------------

async function request(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.detail ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}


// ---------------------------------------------------------
// Convert Supabase record → existing Course Planning plan
// ---------------------------------------------------------

function databaseCourseToPlan(course) {
  if (!course) {
    return null;
  }

  return {
    id: course.id,

    course_metadata:
      course.course_metadata || {
        title: course.title || "",
        subject: course.subject || "",
        target_audience: {},
        duration: "",
        session_frequency: "",
        learning_goals: [],
      },

    modules:
      Array.isArray(course.modules)
        ? course.modules
        : [],

    refineLog:
      Array.isArray(course.refine_log)
        ? course.refine_log
        : [],

    // Convert PostgreSQL timestamps back into
    // the numeric timestamps expected by the UI.
    createdAt:
      course.created_at
        ? new Date(course.created_at).getTime()
        : Date.now(),

    updatedAt:
      course.updated_at
        ? new Date(course.updated_at).getTime()
        : Date.now(),
  };
}


// ---------------------------------------------------------
// Convert existing Course Planning plan
// → Supabase record
// ---------------------------------------------------------

function planToDatabaseCourse(plan) {
  const metadata =
    plan?.course_metadata || {};

  return {
    id: plan?.id,

    title:
      metadata.title ||
      plan?.title ||
      "Untitled Course",

    subject:
      metadata.subject ||
      plan?.subject ||
      "",

    // Preserve the complete metadata object.
    course_metadata:
      metadata,

    // These fields are kept as well because
    // they are useful for filtering/searching.
    target_audience:
      metadata.target_audience
        ? JSON.stringify(
            metadata.target_audience
          )
        : "",

    duration_and_frequency:
      [
        metadata.duration || "",
        metadata.session_frequency || "",
      ]
        .filter(Boolean)
        .join(" · "),

    learning_goals:
      Array.isArray(
        metadata.learning_goals
      )
        ? JSON.stringify(
            metadata.learning_goals
          )
        : "",

    // Preserve the complete module structure.
    modules:
      Array.isArray(plan?.modules)
        ? plan.modules
        : [],

    // The React UI calls this refineLog,
    // while the database column is refine_log.
    refine_log:
      Array.isArray(plan?.refineLog)
        ? plan.refineLog
        : [],

    status:
      plan?.status || "draft",
  };
}


// ---------------------------------------------------------
// Storage API
// ---------------------------------------------------------

export const storage = {

  // =======================================================
  // GET
  // =======================================================

  async get(key, shared = false) {

    // -----------------------------------------------------
    // Get course index
    // -----------------------------------------------------

    if (key === "plan-index") {

      const data = await request(
        "/api/courses"
      );

      const courses =
        data?.courses || [];

      const index = courses.map(
        (course) => ({
          id: course.id,

          title:
            course.course_metadata?.title ||
            course.title ||
            "Untitled Course",

          skillLevel:
            course.course_metadata
              ?.target_audience
              ?.skill_level || "",

          duration:
            course.course_metadata
              ?.duration || "",

          updatedAt:
            course.updated_at
              ? new Date(
                  course.updated_at
                ).getTime()
              : Date.now(),
        })
      );

      return {
        key,

        value: JSON.stringify(index),

        shared,
      };
    }


    // -----------------------------------------------------
    // Get individual course
    // -----------------------------------------------------

    if (key.startsWith("plan:")) {

      const id =
        key.substring(
          "plan:".length
        );

      if (!id) {
        throw new Error(
          "Course ID is missing."
        );
      }

      const data =
        await request(
          `/api/courses/${encodeURIComponent(
            id
          )}`
        );

      const plan =
        databaseCourseToPlan(
          data?.course
        );

      if (!plan) {
        throw new Error(
          `Course not found: ${id}`
        );
      }

      return {
        key,

        value:
          JSON.stringify(plan),

        shared,
      };
    }


    throw new Error(
      `Unsupported storage key: ${key}`
    );
  },


  // =======================================================
  // SET
  // =======================================================

  async set(
    key,
    value,
    shared = false
  ) {

    // -----------------------------------------------------
    // plan-index
    //
    // The index is now generated directly from Supabase.
    // We don't need to store a second copy.
    // -----------------------------------------------------

    if (key === "plan-index") {

      return {
        key,
        value,
        shared,
      };
    }


    // -----------------------------------------------------
    // Save individual plan
    // -----------------------------------------------------

    if (key.startsWith("plan:")) {

      const id =
        key.substring(
          "plan:".length
        );

      let plan;

      try {
        plan =
          typeof value === "string"
            ? JSON.parse(value)
            : value;
      } catch {
        throw new Error(
          "Invalid course plan JSON."
        );
      }


      const databaseCourse =
        planToDatabaseCourse(
          plan
        );


      // ---------------------------------------------------
      // Existing course → UPDATE
      // ---------------------------------------------------

      if (id) {

        const response =
          await request(
            `/api/courses/${encodeURIComponent(
              id
            )}`,
            {
              method: "PUT",

              body:
                JSON.stringify(
                  databaseCourse
                ),
            }
          );

        const savedPlan =
          databaseCourseToPlan(
            response?.course
          );

        return {
          key,

          value:
            JSON.stringify(
              savedPlan
            ),

          shared,
        };
      }


      // ---------------------------------------------------
      // New course → CREATE
      // ---------------------------------------------------

      const response =
        await request(
          "/api/courses",
          {
            method: "POST",

            body:
              JSON.stringify(
                databaseCourse
              ),
          }
        );

      const savedPlan =
        databaseCourseToPlan(
          response?.course
        );

      return {
        key,

        value:
          JSON.stringify(
            savedPlan
          ),

        shared,
      };
    }


    throw new Error(
      `Unsupported storage key: ${key}`
    );
  },


  // =======================================================
  // DELETE
  // =======================================================

  async delete(
    key,
    shared = false
  ) {

    // -----------------------------------------------------
    // Delete individual course
    // -----------------------------------------------------

    if (key.startsWith("plan:")) {

      const id =
        key.substring(
          "plan:".length
        );

      if (!id) {
        throw new Error(
          "Course ID is missing."
        );
      }

      await request(
        `/api/courses/${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      return {
        key,

        deleted: true,

        shared,
      };
    }


    // -----------------------------------------------------
    // plan-index is generated from the database.
    // Nothing needs to be deleted.
    // -----------------------------------------------------

    if (key === "plan-index") {

      return {
        key,

        deleted: true,

        shared,
      };
    }


    throw new Error(
      `Unsupported storage key: ${key}`
    );
  },


  // =======================================================
  // LIST
  // =======================================================

  async list(
    prefix = "",
    shared = false
  ) {

    const data =
      await request(
        "/api/courses"
      );

    const courses =
      data?.courses || [];

    const keys =
      courses.map(
        (course) =>
          `plan:${course.id}`
      );

    return {
      keys,

      prefix,

      shared,
    };
  },
};