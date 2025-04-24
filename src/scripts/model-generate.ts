import fs from "fs";
import path from "path";

// Ambil argumen dari terminal
const args = process.argv.slice(2);
const options: Record<string, string> = {};

args.forEach((arg) => {
  const [key, value] = arg.split("=");
  if (key && value) {
    options[key.replace(/^--/, "")] = value;
  }
});

const name = options.name;
const instance = options.instance;
const schema = options.schema || null;

if (!name || !instance) {
  console.error("❌ Error: --name dan --instance harus diisi");
  process.exit(1);
}

// Nama file model
const fileName = `${name.toLowerCase()}-model.ts`;

// Path tujuan simpan file
const outputPath = path.join(__dirname, "..", "model", fileName);

if (fs.existsSync(outputPath)) {
  console.error(`❌ Model ${name} already exists.`);
  process.exit(1); // hentikan proses
}

// Isi file model
const content = `import { GCModel } from '../config/model';
import { ${instance} } from '../app/database';

interface ${name}Attributes {
}

class ${name}Model extends GCModel<${name}Attributes> {
}

${name}Model.init(
  {},
  {
    sequelize: ${instance},
    modelName: '${name}',
    schema: ${schema ? `'${schema}'` : "null"},
    freezeTableName: true,
    tableName: '${name.toLowerCase()}',
    paranoid: false,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
  }
);

export { ${name}Attributes };
export default ${name}Model;
`;

// Buat folder jika belum ada
const modelDir = path.dirname(outputPath);
if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
}

// Simpan file
fs.writeFileSync(outputPath, content);
console.log(`✅ Model ${name} berhasil dibuat di: src/model/${fileName}`);
