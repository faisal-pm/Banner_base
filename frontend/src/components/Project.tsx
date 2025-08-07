
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Project = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setProject(data);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      setFiles({ ...files, [name]: inputFiles[0] });
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project || Object.keys(files).length === 0) return;

    const formData = new FormData();
    formData.append('projectId', project.id);

    for (const key in files) {
        formData.append(key, files[key]);
    }

    try {
        const response = await fetch('http://localhost:3001/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload files');
        }

        alert('Files uploaded successfully!');
    } catch (error: any) {
        setError(error.message);
    }
  };

  const handleGenerateBanner = async () => {
    if (!project) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate banner');
      }

      const data = await response.json();
      setBannerUrl(data.bannerUrl);
    } catch (error: any) {
      setError(error.message);
    }

    setGenerating(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold">{project.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <Input id="logo" type="file" name="logo" onChange={handleFileChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">Background</Label>
                <Input id="background" type="file" name="background" onChange={handleFileChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product Image</Label>
                <Input id="product" type="file" name="product" onChange={handleFileChange} />
              </div>
              <Button type="submit">Upload</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Generate Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateBanner} disabled={generating} className="w-full">
                {generating ? 'Generating...' : 'Generate Banner'}
              </Button>
            </CardContent>
          </Card>

          {bannerUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Banner</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe src={bannerUrl} width="100%" height="400px" title="Generated Banner"></iframe>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;
