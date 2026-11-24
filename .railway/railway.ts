import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  const web = service("web", {
    source: github("utssachdeva/Restuarant_Recommendation_Utsav", {
      branch: "master",
      checkSuites: false,
    }),
    // Dockerfile CMD / start.py reads PORT from the environment — no $PORT in the string.
    build: {
      buildEnvironment: "V3",
      builder: "DOCKERFILE",
      dockerfilePath: "Dockerfile",
    },
    start: "python start.py",
    replicas: { iad: 1 },
  });

  return project("zippy-essence", {
    variables: { managed: false },
    resources: [web],
  });
});
