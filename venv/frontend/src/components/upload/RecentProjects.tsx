export default function RecentProjects() {

    const projects = [

        {
            name: "Gearbox.step",
            type: "STEP"
        },

        {
            name: "Bracket.iges",
            type: "IGES"
        }

    ];

    return (

        <div className="bg-white rounded-xl shadow p-5">

            <h2 className="text-xl font-semibold mb-4">

                Recent Projects

            </h2>

            <table className="w-full">

                <thead>

                    <tr className="border-b">

                        <th className="text-left py-3">File</th>

                        <th className="text-left">Format</th>

                        <th className="text-left">Status</th>

                    </tr>

                </thead>

                <tbody>

                    {projects.map((p) => (

                        <tr
                            key={p.name}
                            className="border-b"
                        >

                            <td className="py-3">

                                {p.name}

                            </td>

                            <td>

                                {p.type}

                            </td>

                            <td className="text-green-600">

                                Uploaded

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}