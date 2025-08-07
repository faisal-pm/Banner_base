
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    if (!session)
      return;

    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      setError(error.message);
    } else {
      setProjects(data);
    }
    setLoading(false);
  };

  const createProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session || !projectName)
      return;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: projectName, user_id: session.user.id }])
      .select();

    if (error) {
      setError(error.message);
    } else if (data) {
      setProjects([...projects, data[0]]);
      setProjectName('');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => supabase.auth.signOut()}>Sign Out</Button>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createProject} className="flex space-x-4">
              <Input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
                required
                className="flex-grow"
              />
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Your Projects</h2>
        {projects.length === 0 ? (
          <p className="mt-4">You don't have any projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {projects.map((project) => (
              <Link to={`/project/${project.id}`} key={project.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
