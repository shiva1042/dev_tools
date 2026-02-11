import{r as i,j as e,L as T}from"./index-D7pXJXkH.js";import{B as s,P as u,I as x,H as E,T as l}from"./Paper-Cyl37ja4.js";import{T as D}from"./Tooltip-BpGEyTYM.js";import{C as q}from"./ContentCopy-PE5Vu7Zm.js";import{C as P}from"./Chip-sxSLqfvX.js";import{T as p,F as A,I as O,S as R}from"./TextField-DuDeyOSB.js";import{V as $}from"./VisibilityOff-Bysexlvc.js";import{V as U}from"./Visibility-Ct9Cs83u.js";import{F}from"./FormControlLabel-CPJ5-c3p.js";import{S as H}from"./Switch-DkkzjR19.js";import{M as m}from"./MenuItem-C1kwkJyb.js";import{T as W,a as J}from"./Tab-qKNGPrBq.js";import{S as V}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./SwitchBase-BJFlT-yl.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";const c={postgresql:{defaultPort:5432,driver:"org.postgresql.Driver",urlPattern:"jdbc:postgresql://{host}:{port}/{database}",mavenDep:`<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
</dependency>`,gradleDep:"implementation 'org.postgresql:postgresql:42.7.1'"},mysql:{defaultPort:3306,driver:"com.mysql.cj.jdbc.Driver",urlPattern:"jdbc:mysql://{host}:{port}/{database}",mavenDep:`<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
</dependency>`,gradleDep:"implementation 'com.mysql:mysql-connector-j:8.3.0'"},oracle:{defaultPort:1521,driver:"oracle.jdbc.OracleDriver",urlPattern:"jdbc:oracle:thin:@{host}:{port}:{database}",mavenDep:`<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc11</artifactId>
    <version>23.3.0.23.09</version>
</dependency>`,gradleDep:"implementation 'com.oracle.database.jdbc:ojdbc11:23.3.0.23.09'"},sqlserver:{defaultPort:1433,driver:"com.microsoft.sqlserver.jdbc.SQLServerDriver",urlPattern:"jdbc:sqlserver://{host}:{port};databaseName={database}",mavenDep:`<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <version>12.4.2.jre11</version>
</dependency>`,gradleDep:"implementation 'com.microsoft.sqlserver:mssql-jdbc:12.4.2.jre11'"},h2:{defaultPort:9092,driver:"org.h2.Driver",urlPattern:"jdbc:h2:{mode}:{database}",mavenDep:`<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>2.2.224</version>
</dependency>`,gradleDep:"implementation 'com.h2database:h2:2.2.224'"},mongodb:{defaultPort:27017,driver:"mongodb.jdbc.MongoDriver",urlPattern:"mongodb://{host}:{port}/{database}",mavenDep:`<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>mongodb-driver-sync</artifactId>
    <version>4.11.1</version>
</dependency>`,gradleDep:"implementation 'org.mongodb:mongodb-driver-sync:4.11.1'"},neo4j:{defaultPort:7687,driver:"org.neo4j.jdbc.Driver",urlPattern:"jdbc:neo4j:bolt://{host}:{port}",mavenDep:`<dependency>
    <groupId>org.neo4j</groupId>
    <artifactId>neo4j-jdbc-driver</artifactId>
    <version>5.13.0</version>
</dependency>`,gradleDep:"implementation 'org.neo4j:neo4j-jdbc-driver:5.13.0'"},elasticsearch:{defaultPort:9200,driver:"org.elasticsearch.xpack.sql.jdbc.EsDriver",urlPattern:"jdbc:es://{host}:{port}",mavenDep:`<dependency>
    <groupId>org.elasticsearch.plugin</groupId>
    <artifactId>x-pack-sql-jdbc</artifactId>
    <version>8.11.3</version>
</dependency>`,gradleDep:"implementation 'org.elasticsearch.plugin:x-pack-sql-jdbc:8.11.3'"},redis:{defaultPort:6379,driver:"N/A (Use Jedis/Lettuce)",urlPattern:"redis://{host}:{port}",mavenDep:`<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>5.1.0</version>
</dependency>
<!-- Or use Lettuce -->
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
    <version>6.3.1.RELEASE</version>
</dependency>`,gradleDep:`implementation 'redis.clients:jedis:5.1.0'
// Or use Lettuce
implementation 'io.lettuce:lettuce-core:6.3.1.RELEASE'`}};function pe(){const[f,w]=i.useState(0),[b,M]=i.useState(!1),[r,n]=i.useState({type:"postgresql",host:"localhost",port:5432,database:"mydb",username:"postgres",password:"",ssl:!1,sslMode:"prefer",options:{}}),[g,k]=i.useState("mem"),[h,y]=i.useState({open:!1,message:""}),d=i.useMemo(()=>{const t=c[r.type];if(!t)return"";let o=t.urlPattern.replace("{host}",r.host).replace("{port}",String(r.port)).replace("{database}",r.database);r.type==="h2"&&(o=o.replace("{mode}",g),g==="file"&&(o=o.replace(r.database,`./data/${r.database}`)));const a=[];if(r.type==="postgresql"&&(r.schema&&a.push(`currentSchema=${r.schema}`),r.ssl&&a.push(`ssl=true&sslmode=${r.sslMode||"require"}`)),r.type==="mysql"&&(a.push("useSSL="+r.ssl),a.push("serverTimezone=UTC"),a.push("allowPublicKeyRetrieval=true")),r.type==="sqlserver"&&(r.ssl&&a.push("encrypt=true"),a.push("trustServerCertificate="+!r.ssl)),Object.entries(r.options).forEach(([j,I])=>{I&&a.push(`${j}=${I}`)}),a.length>0){const j=r.type==="sqlserver"?";":r.type==="oracle"?"?":o.includes("?")?"&":"?";o+=j+a.join(r.type==="sqlserver"?";":"&")}return o},[r,g]),B=i.useMemo(()=>{const t=c[r.type];return t?`# Spring Boot Datasource Configuration
spring.datasource.url=${d}
spring.datasource.username=${r.username}
spring.datasource.password=\${DB_PASSWORD:${r.password||"changeme"}}
spring.datasource.driver-class-name=${t.driver}

# HikariCP Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=30000

# JPA Settings (if using JPA)
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true`:""},[d,r]),L=i.useMemo(()=>c[r.type]?`import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {

    private static final String URL = "${d}";
    private static final String USER = "${r.username}";
    private static final String PASSWORD = System.getenv("DB_PASSWORD"); // Use env variable

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void main(String[] args) {
        try (Connection conn = getConnection()) {
            System.out.println("Connected successfully!");
            System.out.println("Database: " + conn.getMetaData().getDatabaseProductName());
            System.out.println("Version: " + conn.getMetaData().getDatabaseProductVersion());
        } catch (SQLException e) {
            System.err.println("Connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`:"",[d,r]),S=i.useMemo(()=>{const t=c[r.type];return t?{maven:t.mavenDep,gradle:t.gradleDep}:{maven:"",gradle:""}},[r.type]),C=async t=>{await navigator.clipboard.writeText(t),y({open:!0,message:"Copied to clipboard"})},z=t=>{const o=c[t];n({...r,type:t,port:o?.defaultPort||r.port})},v=[{label:"Connection String",content:d},{label:"Spring Boot",content:B},{label:"Java Code",content:L},{label:"Maven",content:S.maven},{label:"Gradle",content:S.gradle}];return e.jsxs(s,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[e.jsx(u,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:e.jsxs(s,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs(s,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(T,{to:"/",children:e.jsx(x,{size:"small",sx:{color:"grey.500"},children:e.jsx(E,{})})}),e.jsx(l,{variant:"h5",sx:{color:"white",fontWeight:600},children:"JDBC Connection String Builder"})]}),e.jsx(D,{title:"Copy Connection String",children:e.jsx(x,{onClick:()=>C(d),sx:{color:"grey.500"},children:e.jsx(q,{})})})]})}),e.jsxs(s,{sx:{display:"flex",height:"calc(100vh - 70px)"},children:[e.jsxs(s,{sx:{flex:1,p:2,overflow:"auto"},children:[e.jsxs(u,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsx(l,{variant:"subtitle1",sx:{color:"grey.300",mb:2},children:"Database Type"}),e.jsx(s,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:Object.keys(c).map(t=>e.jsx(P,{label:t.toUpperCase(),color:r.type===t?"primary":"default",onClick:()=>z(t),sx:{cursor:"pointer"}},t))})]}),e.jsxs(u,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsx(l,{variant:"subtitle1",sx:{color:"grey.300",mb:2},children:"Connection Settings"}),r.type==="h2"&&e.jsxs(s,{sx:{mb:2},children:[e.jsx(l,{variant:"caption",sx:{color:"grey.500",mb:1,display:"block"},children:"H2 Mode"}),e.jsx(s,{sx:{display:"flex",gap:1},children:["mem","file","tcp"].map(t=>e.jsx(P,{label:t.toUpperCase(),color:g===t?"primary":"default",onClick:()=>k(t),sx:{cursor:"pointer"}},t))})]}),e.jsxs(s,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(p,{size:"small",label:"Host",value:r.host,onChange:t=>n({...r,host:t.target.value}),sx:{flex:2,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(p,{size:"small",label:"Port",type:"number",value:r.port,onChange:t=>n({...r,port:parseInt(t.target.value)||0}),sx:{width:100,"& .MuiInputBase-root":{color:"grey.300"}}})]}),e.jsxs(s,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(p,{size:"small",label:"Database",value:r.database,onChange:t=>n({...r,database:t.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),r.type==="postgresql"&&e.jsx(p,{size:"small",label:"Schema",value:r.schema||"",onChange:t=>n({...r,schema:t.target.value}),placeholder:"public",sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}})]}),e.jsxs(s,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(p,{size:"small",label:"Username",value:r.username,onChange:t=>n({...r,username:t.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(p,{size:"small",label:"Password",type:b?"text":"password",value:r.password,onChange:t=>n({...r,password:t.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}},InputProps:{endAdornment:e.jsx(x,{size:"small",onClick:()=>M(!b),sx:{color:"grey.500"},children:b?e.jsx($,{fontSize:"small"}):e.jsx(U,{fontSize:"small"})})}})]}),e.jsxs(s,{sx:{display:"flex",gap:3,alignItems:"center"},children:[e.jsx(F,{control:e.jsx(H,{checked:r.ssl,onChange:t=>n({...r,ssl:t.target.checked}),size:"small"}),label:e.jsx(l,{sx:{color:"grey.400",fontSize:14},children:"SSL/TLS"})}),r.ssl&&r.type==="postgresql"&&e.jsxs(A,{size:"small",sx:{minWidth:150},children:[e.jsx(O,{sx:{color:"grey.500"},children:"SSL Mode"}),e.jsxs(R,{value:r.sslMode||"prefer",label:"SSL Mode",onChange:t=>n({...r,sslMode:t.target.value}),sx:{color:"grey.300"},children:[e.jsx(m,{value:"disable",children:"disable"}),e.jsx(m,{value:"allow",children:"allow"}),e.jsx(m,{value:"prefer",children:"prefer"}),e.jsx(m,{value:"require",children:"require"}),e.jsx(m,{value:"verify-ca",children:"verify-ca"}),e.jsx(m,{value:"verify-full",children:"verify-full"})]})]})]})]}),e.jsxs(u,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(l,{variant:"subtitle1",sx:{color:"grey.300",mb:1},children:"Driver Information"}),e.jsx(l,{variant:"body2",sx:{color:"grey.500",fontFamily:"monospace"},children:c[r.type]?.driver||"N/A"})]})]}),e.jsxs(s,{sx:{width:550,borderLeft:"1px solid #222",display:"flex",flexDirection:"column"},children:[e.jsx(s,{sx:{borderBottom:"1px solid #222"},children:e.jsx(W,{value:f,onChange:(t,o)=>w(o),variant:"scrollable",scrollButtons:"auto",children:v.map((t,o)=>e.jsx(J,{label:t.label,sx:{color:"grey.400",fontSize:11,minWidth:80}},o))})}),e.jsx(s,{sx:{p:2,borderBottom:"1px solid #222",display:"flex",justifyContent:"flex-end"},children:e.jsx(D,{title:"Copy",children:e.jsx(x,{size:"small",onClick:()=>C(v[f].content),sx:{color:"grey.500"},children:e.jsx(q,{fontSize:"small"})})})}),e.jsx(s,{sx:{flex:1,p:2,overflow:"auto"},children:e.jsx(u,{sx:{bgcolor:"#0a0a0a",p:2,border:"1px solid #333",height:"100%"},children:e.jsx(l,{component:"pre",sx:{fontFamily:"monospace",fontSize:11,color:"#d4d4d4",m:0,whiteSpace:"pre-wrap",wordBreak:"break-all"},children:v[f].content})})})]})]}),e.jsx(V,{open:h.open,autoHideDuration:2e3,onClose:()=>y({...h,open:!1}),message:h.message})]})}export{pe as default};
//# sourceMappingURL=App-x7e62CsS.js.map
