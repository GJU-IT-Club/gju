import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const url = new URL(request.url);
    const courseId = url.searchParams.get('id');
    
    if (!courseId) {
      return new Response(JSON.stringify({ error: 'Course ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const coursesCollection = await getCollection('courseContent');
    
    const course = coursesCollection.find(course => course.data.id === courseId);
    
    if (!course) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      content: course.body,
      metadata: course.data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching course content:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
