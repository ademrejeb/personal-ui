import type { PropDoc } from "../registry/types";

interface PropsTableProps {
  props: PropDoc[];
}

export function PropsTable({ props }: PropsTableProps) {
  return (
    <table className="lab-props">
      <thead>
        <tr>
          <th scope="col">Prop</th>
          <th scope="col">Type</th>
          <th scope="col">Default</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        {props.map((prop) => (
          <tr key={prop.name}>
            <td className="lab-props__name">
              {prop.name}
              {prop.required ? <span className="lab-props__required"> *</span> : null}
            </td>
            <td className="lab-props__type">{prop.type}</td>
            <td>
              <code>{prop.default ?? "—"}</code>
            </td>
            <td>{prop.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
